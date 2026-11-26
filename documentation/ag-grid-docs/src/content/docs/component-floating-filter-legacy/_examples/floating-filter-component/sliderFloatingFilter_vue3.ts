import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { IFloatingFilterParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IFloatingFilterParams & { maxValue: number }>,
            required: true,
        },
    },
    template: `
      <input type="range"
             :value="currentValue"
             min="0"
             :max="maxValue"
             step="1"
             @change="valueChanged($event)"/>
    `,
    data: function () {
        return {
            maxValue: 0,
            currentValue: 0 as number | string,
        };
    },
    beforeMount() {
        this.maxValue = this.params.maxValue;
    },
    methods: {
        valueChanged(event: Event) {
            this.currentValue = (event.target as HTMLInputElement).value;
            let valueToUse = this.currentValue === '0' ? null : this.currentValue;
            this.params.parentFilterInstance(function (instance) {
                instance.onFloatingFilterChanged('greaterThan', valueToUse);
            });
        },

        onParentModelChanged(parentModel: any) {
            // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
            // so just read off the value and use that
            this.currentValue = !parentModel ? 0 : parentModel.filter;
        },
    },
});
