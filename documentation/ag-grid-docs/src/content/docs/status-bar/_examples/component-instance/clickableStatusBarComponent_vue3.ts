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
      <div class="container" v-if="visible">
      <div>
          <span class="component">Status Bar Component&nbsp;
            <input type="button" v-on:click="onClick" value="Click Me"/>
          </span>
      </div>
      </div>
    `,
    data: function () {
        return {
            visible: true,
        };
    },
    methods: {
        onClick() {
            console.log('Selected Row Count: ' + this.params.api.getSelectedRows().length);
        },
        setVisible(visible: boolean) {
            this.visible = visible;
        },
        isVisible(): boolean {
            return this.visible;
        },
    },
});
