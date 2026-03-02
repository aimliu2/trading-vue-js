// import Utils from '../stuff/utils.js'
import DCCore from './dc_core.js'
import SettProxy from './sett_proxy.js'
import AggTool from './agg_tool.js'


/**
 * @class Datacube
 * @desc Datacube object builder.js
 */
export default class DataCube extends DCCore {

    constructor(data = {}, sett = {}) {

        let def_sett = {
            aggregation: 100,       // Update aggregation interval
            script_depth: 0,        // 0 === Exec on all data
            auto_scroll: true,      // Auto scroll to a new candle
            scripts: true,          // Enable overlays scripts,
            ww_ram_limit: 0,        // WebWorker RAM limit (MB)
            node_url: null,         // Use node.js instead of WW
            shift_measure: true     // Draw measurment shift+click
        }
        sett = Object.assign(def_sett, sett)

        /**
         * Call all DC_CORE Constructors which extended from DC_event
         * this.ww and this.ww.onevent .... 
         */
        super() // call all [DCCore] Constructor, inherit every this. ...
        this.sett = sett
        this.data = data
        this.sett = SettProxy(sett, this.ww)
        this.agg = new AggTool(this, sett.aggregation)
        this.se_state = {}

        //this.agg.update = this.agg_update.bind(this)
    }

    /**
     * @function add
     * @desc add overlay? into datacube
     * @memberof Datacube
     * @param {string} side - overlay location. exclusive to 3 locations 'onchart', 'offchart', or 'datasets'
     * @param {object} overlay - overlay data
     * @returns {string} id - id of new overlay added
     */
    add(side, overlay) {

        if (side !== 'onchart' && side !== 'offchart' &&
            side !== 'datasets') {
            return
        }

        this.data[side].push(overlay)
        this.update_ids()

        return overlay.id
    }

    /**
     * @function get
     * @param {*} query 
     * @memberof Datacube
     * @returns get data specified in query
     */
    get(query) {return this.get_by_query(query).map(x => x.v)}
    get_one(query) {return this.get_by_query(query).map(x => x.v)[0]}

    // Set data (reactively)
    set(query, data) {

        let objects = this.get_by_query(query)

        for (var obj of objects) {

            let i = obj.i !== undefined ?
                obj.i :
                obj.p.indexOf(obj.v)

            if (i !== -1) {
                obj.p[i] = data
                // this.tv.$set(obj.p, i, data)
            }
        }

        this.update_ids()

    }

    // Merge object or array (reactively)
    merge(query, data) {

        let objects = this.get_by_query(query)

        for (var obj of objects) {
            if (Array.isArray(obj.v)) {
                if (!Array.isArray(data)) continue
                // If array is a timeseries, merge it by timestamp
                // else merge by item index
                if (obj.v[0] && obj.v[0].length >= 2) {
                    this.merge_ts(obj, data)
                } else {
                    this.merge_objects(obj, data, [])
                }
            } else if (typeof obj.v === 'object') {
                this.merge_objects(obj, data)
            }
        }

        this.update_ids()

    }

    // Remove an overlay by query (id/type/name/...)
    del(query) {

        let objects = this.get_by_query(query)

        for (var obj of objects) {

            // Find current index of the field (if not defined)
            let i = typeof obj.i !== 'number' ?
                obj.i : obj.p.indexOf(obj.v)

            if (i !== -1) {
                if (typeof i === 'number') {
                    obj.p.splice(i, 1) // replaces Vue2 $delete — removes cleanly, no null slots
                } else {
                    obj.p[i] = null // field deletion (e.g. overlay property), null is fine here
                }
            }

        }

        this.update_ids()
    }

    // Update/append data point, depending on timestamp
    update(data) {
        if(data['candle']) {
            return this.update_candle(data)
        } else {
            return this.update_tick(data)
        }
    }

    // Lock overlays from being pulled by query_search
    // TODO: subject to review
    lock(query) {
        let objects = this.get_by_query(query)
        objects.forEach(x => {
            if (x.v && x.v.id && x.v.type) {
                x.v.locked = true
            }
        })
    }

    // Unlock overlays from being pulled by query_search
    //
    unlock(query) {
        let objects = this.get_by_query(query, true)
        objects.forEach(x => {
            if (x.v && x.v.id && x.v.type) {
                x.v.locked = false
            }
        })
    }

    // Show indicator
    show(query) {
        if (query === 'offchart' || query === 'onchart') {
             query += '.'
        } else if (query === '.') {
            query = ''
        }
        this.merge(query + '.settings', { display: true })
    }

    // Hide indicator
    hide(query) {
        if (query === 'offchart' || query === 'onchart') {
             query += '.'
        } else if (query === '.') {
             query = ''
        }
        this.merge(query + '.settings', { display: false })
    }

    // Set data loader callback
    onrange(callback) {
        this.loader = callback
        setTimeout(() =>
            this.tv.set_loader(callback ? this : null), 0
        )
    }

}
