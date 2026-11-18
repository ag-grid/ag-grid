import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { FloatingFilterDisplayParams, ICombinedSimpleModel, NumberFilterModel } from 'ag-grid-community';
import { isCombinedFilterModel } from 'ag-grid-community';

type NumberFloatingFilterParams = FloatingFilterDisplayParams<
    any,
    any,
    NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>
> & { color: string };

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<NumberFloatingFilterParams>,
            required: true,
        },
    },
    template: `
      <span>
        &gt; <input v-bind:style="{ borderColor: params.color, width: '30px' }" type="number" min="0" v-model="currentValue"
             v-on:input="onInputBoxChanged()"/>
      </span>
    `,
    data: function () {
        return {
            currentValue: null as string | null,
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

        refresh(params: NumberFloatingFilterParams) {
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
});
