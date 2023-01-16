import {nextTick} from 'vue';

export default {
    template: `<input v-model="value" :ref="'input'" class="my-simple-editor" />`,
    data() {
        return {
            value: null
        };
    },
    methods: {
        getValue() {
            return this.value;
        },

        myCustomFunction() {
            return {
                rowIndex: this.params.rowIndex,
                colId: this.params.column.getId()
            };
        },

        getInitialValue() {
            let startValue = this.params.value;

            if (this.params.charPress) {
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
        nextTick(() => {
            this.$refs.input.focus();
        });
    }
};
