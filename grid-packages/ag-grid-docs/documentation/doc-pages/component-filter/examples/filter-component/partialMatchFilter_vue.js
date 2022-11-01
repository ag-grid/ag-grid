export default {
    template: `
      <div style="border: 2px solid #22ff22;border-radius: 5px; background-color: #bbffbb; width: 200px; height: 50px">
      <div style="margin-left: 20px">
        Partial Match Filter: <input style="height: 20px" :ref="'input'" v-model="text">
      </div>
      </div>
    `,
    data() {
        return {
            text: '',
        }
    },
    methods: {
        isFilterActive() {
            return this.text !== null && this.text !== undefined && this.text !== '';
        },

        doesFilterPass(params) {
            const { api, colDef, column, columnApi, context, valueGetter } = this.params;
            const { node } = params;
            const value = valueGetter({
                api,
                colDef,
                column,
                columnApi,
                context,
                data: node.data,
                getValue: (field) => node.data[field],
                node,
            }).toString().toLowerCase();

            return !this.text || this.text.toLowerCase()
                .split(" ")
                .every((filterWord) => {
                    return value.indexOf(filterWord) >= 0;
                });
        },

        getModel() {
            if (!this.isFilterActive()) { return null; }

            return { value: this.text };
        },

        setModel(model) {
            this.text = model == null ? null : model.value;
        },

        afterGuiAttached() {
            this.$refs.input.focus();
        },

        componentMethod(message) {
            alert(`Alert from PartialMatchFilterComponent ${message}`);
        },
    },
    watch: {
        'text': function (val, oldVal) {
            if (val !== oldVal) {
                this.params.filterChangedCallback();
            }
        }
    },
}
