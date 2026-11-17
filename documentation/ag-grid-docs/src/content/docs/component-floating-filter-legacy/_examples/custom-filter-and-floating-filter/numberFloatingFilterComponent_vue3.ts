import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { IFloatingFilterParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<
                IFloatingFilterParams<{ myMethodForTakingValueFromFloatingFilter(value: number | string | null): void }>
            >,
            required: true,
        },
    },
    template: `
      <span>
        &gt; <input style="width: 30px" type="number" min="0" v-model="currentValue" v-on:input="onInputBoxChanged()"/>
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
                    instance.myMethodForTakingValueFromFloatingFilter(null);
                });
                return;
            }

            this.params.parentFilterInstance((instance) => {
                instance.myMethodForTakingValueFromFloatingFilter(this.currentValue);
            });
        },

        onParentModelChanged(parentModel: number | null) {
            // When the filter is empty we will receive a null value here
            if (parentModel == null) {
                this.currentValue = '';
            } else {
                this.currentValue = parentModel;
            }
        },
    },
});
