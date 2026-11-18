import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { IFloatingFilterParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IFloatingFilterParams & { color: string }>,
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
            currentValue: null as number | string | null,
        };
    },
    methods: {
        onInputBoxChanged() {
            if (this.currentValue === '') {
                // Remove the filter
                this.params.parentFilterInstance((instance) => {
                    instance.onFloatingFilterChanged(null, null);
                });
                return;
            }

            this.params.parentFilterInstance((instance) => {
                instance.onFloatingFilterChanged('greaterThan', this.currentValue);
            });
        },

        onParentModelChanged(parentModel: any) {
            // When the filter is empty we will receive a null value here
            if (!parentModel) {
                this.currentValue = '';
            } else {
                this.currentValue = parentModel.filter;
            }
        },
    },
});
