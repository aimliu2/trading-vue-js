// crosshair constructor

/**
 * @params {Object} Vue props object form defineProps({})
 * @required : props.cursor 
 * and other props from components
 * 
 */

// TO-DO
// optimization :  this class was extend from somewhere
export default class Crosshair {

    constructor(props) {
        // this.comp = comp // directly inject props here
        this.$p = props
        // this.data = this.$p.sub // omitted !?
        this._visible = false
        // this.locked = false // ommited !?
        this.layout = this.$p.layout

    }

    draw(ctx) {
        // Update reference to the grid
        this.layout = this.$p.layout

        // const cursor = this.comp.$props.cursor
        const cursor = this.$p.cursor
        if (!this.visible && cursor.mode === 'explore') return

        this.x = this.$p.cursor.x
        this.y = this.$p.cursor.y

        ctx.save()
        ctx.strokeStyle = this.$p.colors.cross
        ctx.beginPath()
        ctx.setLineDash([5])

        // H
        if (this.$p.cursor.grid_id === this.layout.id) {
            ctx.moveTo(0, this.y)
            ctx.lineTo(this.layout.width - 0.5, this.y)
        }

        // V
        ctx.moveTo(this.x, 0)
        ctx.lineTo(this.x, this.layout.height)
        ctx.stroke()
        ctx.restore()

    }

    hide() {
        this.visible = false
        this.x = undefined
        this.y = undefined
    }

    get visible() {
        return this._visible
    }

    set visible(val) {
        this._visible = val
    }

}
