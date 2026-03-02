<script>
// TODO : make this a composable, and use it in Grid.vue, Crosshair.vue, Legend.vue, etc. 
// to listen to keyboard events globally and emit them to the parent component

export default {
    name: 'KeyboardListener',
    render(h) { return h() },
    created: function () {
        this.$emit('register-kb-listener', {
            id: this._uid,
            keydown: this.keydown,
            keyup: this.keyup,
            keypress: this.keypress
        })
    },
    beforeDestroy: function () {
        this.$emit('remove-kb-listener', {
            id: this._uid
        })
    },
    methods: {
        keydown (event) {
            this.$emit('keydown', event)
        },
        keyup (event) {
            this.$emit('keyup', event)
        },
        keypress (event) {
            this.$emit('keypress', event)
        },
    }
}

</script>
