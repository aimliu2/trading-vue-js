// TO-DO : optimization

/**
 * @class Crosshair
 * @desc A grid overlay-renderer that draws a crosshair at the cursor position.
 *       The crosshair is only visible when the cursor is in 'explore' mode.
 *       The horizontal line is only drawn when the cursor is on the same grid as the layout.
 */
export default class Crosshair {

    /**
     * @constructor
     * @param {*} props 
     * @memberof Crosshair
     */
    constructor(props) {
        this.$p = props
        this._visible = false
        this.layout = this.$p.layout

    }

    /**
     * @method draw
     * @param {Object} ctx - canvas context from HTMLCanvasElement.getContext('2d')
     * @memberof Crosshair
     * @desc Draws the crosshair on the canvas. The horizontal line is only drawn when the cursor is on the same grid as the layout.
     */
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

    /**
     * @method hide
     * @memberof Crosshair 
     * @desc Hides the crosshair by setting visible to false and clearing the x and y coordinates.
     */
    hide() {
        this.visible = false
        this.x = undefined
        this.y = undefined
    }

    /**
     * @method visible
     * @memberof Crosshair
     * @desc Getter and setter for the visible property. The visible property determines whether the crosshair is drawn on the canvas.
     */
    get visible() {
        return this._visible
    }

    set visible(val) {
        this._visible = val
    }

}
