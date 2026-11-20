import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IFilterParams>,
            required: true,
        },
    },
    template: `
      <div style="padding: 4px">
          <div style="font-weight: bold;">Greater than:</div>
          <div>
            <input style="margin: 4px 0 4px 0;" type="number" min="0" v-model="filterText" placeholder="Number of medals..."/>
          </div>
      </div>
    `,
    data: function () {
        return {
            filterText: null as number | string | null,
        };
    },
    watch: {
        filterText(newFilterText, oldFilterText) {
            this.params.filterChangedCallback();
        },
    },
    methods: {
        isFilterActive(): boolean {
            return (
                this.filterText !== null &&
                this.filterText !== undefined &&
                this.filterText !== '' &&
                this.isNumeric(this.filterText)
            );
        },

        doesFilterPass(params: IDoesFilterPassParams) {
            const value = this.params.getValue(params.node);

            if (this.isFilterActive()) {
                if (value == null) return false;
                return Number(value) > Number(this.filterText);
            }
        },

        isNumeric(n: any): boolean {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        getModel() {
            return this.isFilterActive() ? Number(this.filterText) : null;
        },

        setModel(model: number | null) {
            this.filterText = model;
        },

        getModelAsString(): string {
            return this.isFilterActive() ? '>' + this.filterText : '';
        },
    },
});
