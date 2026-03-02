// Canvas context for text measurments
// font string as input
function ContextFont(font) {

    let el = document.createElement('canvas')
    let ctx = el.getContext("2d")
    ctx.font = font

    return ctx

}

export default ContextFont
