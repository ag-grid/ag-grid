import {nextTick, ref} from 'vue';

export default {
    template: `<input type="number" v-model="value" ref="input" class="doubling-input" />`,
    setup(props) {
        // the current/initial value of the cell (before editing)
        const value = ref(props.params.value);

        /* Component Editor Lifecycle methods */
        // the final value to send to the grid, on completion of editing
        const getValue = () => {
            // this simple editor doubles any value entered into the input
            return value.value * 2;
        };

        // Gets called once before editing starts, to give editor a chance to
        // cancel the editing before it even starts.
        const isCancelBeforeStart = () => {
            return false;
        };

        // Gets called once when editing is finished (eg if Enter is pressed).
        // If you return true, then the result of the edit will be ignored.
        const isCancelAfterEnd = () => {
            // our editor will reject any value greater than 1000
            return value.value > 1000;
        };

        return {
            value,
            getValue,
            isCancelBeforeStart,
            isCancelAfterEnd
        }
    },
    mounted() {
        // focus on the input field once editing starts
        nextTick(() => this.$refs.input.focus());
    }
};
