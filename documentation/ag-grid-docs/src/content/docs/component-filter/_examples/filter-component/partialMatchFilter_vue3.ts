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
      <div class="partial-match-filter">
        <div>Partial Match Filter</div>
        <div>
            <input type="text" ref="eFilterText" v-model="filterText" v-on:input="updateFilter($event)" />
        </div>
      </div>
    `,
    data: function () {
        return {
            filterText: null as string | null,
        };
    },
    methods: {
        updateFilter(event: Event) {
            const value = (event?.target as HTMLInputElement | null)?.value;
            this.params.onModelChange(value == null || value === '' ? null : value);
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

        componentMethod(message: string) {
            console.log(`Alert from PartialMatchFilterComponent ${message}`);
        },
    },
    mounted: function () {
        this.refresh(this.params);
    },
});
