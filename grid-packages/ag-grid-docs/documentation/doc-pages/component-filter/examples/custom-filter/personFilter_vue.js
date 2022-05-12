export default {
    template: `
      <div style="padding: 4px; width: 200px;">
      <div style="font-weight: bold;">Custom Athlete Filter</div>
      <div>
        <input style="margin: 4px 0 4px 0;" type="text" v-model="filterText" v-on:keyup="updateFilter($event)" placeholder="Full name search..."/>
      </div>
      <div style="margin-top: 20px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>
      <div style="margin-top: 20px;">Just to emphasise that anything can go in here, here is an image!!</div>
      <div>
        <img src="https://www.ag-grid.com/images/ag-Grid2-200.png"
             style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey;"/>
      </div>
      </div>
    `,
    data: function () {
        return {
            filterText: null
        };
    },
    methods: {
        updateFilter() {
            this.params.filterChangedCallback();
        },

        doesFilterPass(params) {
            const { api, colDef, column, columnApi, context } = this.params;
            const { node } = params;

            // make sure each word passes separately, ie search for firstname, lastname
            let passed = true;
            this.filterText.toLowerCase().split(' ').forEach(filterWord => {
                const value = this.params.valueGetter({
                    api,
                    colDef,
                    column,
                    columnApi,
                    context,
                    data: node.data,
                    getValue: (field) => node.data[field],
                    node,
                });

                if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
                    passed = false;
                }
            });

            return passed;
        },

        isFilterActive() {
            return this.filterText != null && this.filterText !== '';
        },

        getModel() {
            if (!this.isFilterActive()) { return null; }

            return { value: this.filterText };
        },

        setModel(model) {
            this.filterText = model == null ? null : model.value;
        }
    }
};
