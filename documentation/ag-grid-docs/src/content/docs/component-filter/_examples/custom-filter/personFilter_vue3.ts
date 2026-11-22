import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { FilterDisplayParams, IAfterGuiAttachedParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<FilterDisplayParams<any, any, string>>,
            required: true,
        },
    },
    template: `
      <div class="person-filter">
        <div>Custom Athlete Filter</div>
        <div>
            <input type="text" ref="eFilterText" v-model="filterText" v-on:input="updateFilter($event)" v-on:paste="updateFilter($event)" placeholder="Full name search..."/>
        </div>
        <div>This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>
      </div>
    `,
    data: function () {
        return {
            filterText: null as string | null,
        };
    },
    methods: {
        updateFilter() {
            this.params.onModelChange(this.filterText == null || this.filterText === '' ? null : this.filterText);
        },

        refresh(newParams: FilterDisplayParams<any, any, string>): boolean {
            const currentValue = this.filterText;
            const newValue = newParams.model ?? '';
            if (newValue !== currentValue) {
                this.filterText = newValue;
            }
            return true;
        },

        afterGuiAttached(params?: IAfterGuiAttachedParams) {
            if (!params || !params.suppressFocus) {
                // focus the input element for keyboard navigation
                (this.$refs.eFilterText as HTMLInputElement).focus();
            }
        },
    },
    mounted: function () {
        this.refresh(this.params);
    },
});
