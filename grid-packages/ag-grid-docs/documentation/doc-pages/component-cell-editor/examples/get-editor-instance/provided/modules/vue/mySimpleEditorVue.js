import Vue from 'vue';

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

export default Vue.extend({
    template: `<input v-model="value" :ref="'input'" />`,
    data() {
        return {
            value: null
        };
    },
    methods: {
        getValue() {
            return this.happy ? 'Happy' : 'Sad';
        },

        myCustomFunction() {
            return {
                rowIndex: this.params.rowIndex,
                colId: this.params.column.getId()
            };
        },

        getInitialValue() {
            let startValue = this.params.value;

            const keyPressBackspaceOrDelete = this.params.keyPress === KEY_BACKSPACE || this.params.keyPress === KEY_DELETE;
            if (keyPressBackspaceOrDelete) {
                startValue = '';
            } else if (this.params.charPress) {
                startValue = this.params.charPress;
            }

            if (startValue !== null && startValue !== undefined) {
                return startValue;
            }

            return '';
        }
    },
    created() {
        this.value = this.getInitialValue();
    },
    mounted() {
        Vue.nextTick(() => {
            this.$refs.input.focus();
        });
    }
});
