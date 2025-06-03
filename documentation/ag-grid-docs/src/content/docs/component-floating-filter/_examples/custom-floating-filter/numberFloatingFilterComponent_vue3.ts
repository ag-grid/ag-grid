import { isCombinedFilterModel } from 'ag-grid-community';

export default {
    template: `
      <span>
        &gt; <input v-bind:style="{ borderColor: params.color, width: '30px' }" type="number" min="0" v-model="currentValue"
             v-on:input="onInputBoxChanged()"/>
      </span>
    `,
    data: function () {
        return {
            currentValue: null,
        };
    },
    methods: {
        onInputBoxChanged() {
            if (this.currentValue === '') {
                // Remove the filter
                this.params.onModelChange(null);
                return;
            }

            this.params.onModelChange({
                filterType: 'number',
                type: 'greaterThan',
                filter: Number(this.currentValue),
            });
        },

        refresh(params) {
            // if the update is from the floating filter, we don't need to update the UI
            if (params.source !== 'ui') {
                const model = params.model;
                if (model == null) {
                    this.currentValue = '';
                } else {
                    const value = isCombinedFilterModel(model) ? model.conditions[0]?.filter : model.filter;
                    this.currentValue = String(value);
                }
            }
        },
    },
    mounted: function () {
        this.refresh(this.params);
    },
};
