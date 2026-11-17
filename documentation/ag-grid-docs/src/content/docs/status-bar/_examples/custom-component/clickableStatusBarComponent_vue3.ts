import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { IStatusPanelParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IStatusPanelParams>,
            required: true,
        },
    },
    template: `
      <div class="ag-status-name-value">
          <span>Status Bar Component&nbsp; 
            <input type="button" class="status-bar-input" v-on:click="onClick" value="Click Me"/>
          </span>
      </div>
    `,
    data: function () {
        return {};
    },
    methods: {
        onClick() {
            console.log('Selected Row Count: ' + this.params.api.getSelectedRows().length);
        },
    },
});
