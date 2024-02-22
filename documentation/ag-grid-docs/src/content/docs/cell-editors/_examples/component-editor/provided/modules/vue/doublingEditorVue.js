import {nextTick} from 'vue';

export default {
    template: `<input type="number" v-model="value" ref="input" class="doubling-input" />`,
    data() {
        return {
            value: null
        };
    },
    methods: {
        /* Component Editor Lifecycle methods */
        // the final value to send to the grid, on completion of editing
        getValue() {
            // this simple editor doubles any value entered into the input
            return this.value * 2;
        },

        // Gets called once before editing starts, to give editor a chance to
        // cancel the editing before it even starts.
        isCancelBeforeStart() {
            return false;
        },

        // Gets called once when editing is finished (eg if Enter is pressed).
        // If you return true, then the result of the edit will be ignored.
        isCancelAfterEnd() {
            // our editor will reject any value greater than 1000
            return this.value > 1000;
        }
    },
    mounted() {
        this.value = this.params.value;
        nextTick(() => this.$refs.input.focus());
    }
};
