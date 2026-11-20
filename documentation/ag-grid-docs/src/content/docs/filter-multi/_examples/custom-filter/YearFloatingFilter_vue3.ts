import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { FloatingFilterDisplayParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<FloatingFilterDisplayParams<any, any, boolean>>,
            required: true,
        },
    },
    template: `
      <div>
          <div class="year-filter">
            <label>
              <input type="radio" value="false" v-model="isActive" v-on:change="toggleFilter(false)"/> All
            </label>
            <label>
              <input type="radio" value="true" v-model="isActive" v-on:change="toggleFilter(true)"/> After 2010
            </label>
          </div>
      </div>
    `,
    data: function () {
        return {
            isActive: false,
        };
    },
    methods: {
        toggleFilter(isFilterActive: boolean) {
            this.isActive = isFilterActive;
            this.params.onModelChange(isFilterActive || null);
        },

        refresh(params: FloatingFilterDisplayParams<any, any, boolean>) {
            // if the update is from the floating filter, we don't need to update the UI
            if (params.source !== 'ui') {
                this.isActive = !!params.model;
            }
        },
    },
    mounted: function () {
        this.refresh(this.params);
    },
});
