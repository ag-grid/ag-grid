import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { ITooltipParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<ITooltipParams & { type: string }>,
            required: true,
        },
    },
    template: `
      <div class="custom-tooltip">
        <div :class="'panel panel-' + type">
          <div class="panel-heading">
            <h3 class="panel-title">{{ country }}</h3>
          </div>
          <form class="panel-body" @submit="onFormSubmit($event)">
            <div class="form-group">
              <input type="text" class="form-control" id="name" placeholder="Name" autocomplete="off" :value="athlete" @focus="$event.target.select()" />
              <button type="submit" class="btn btn-primary">Submit</button>
            </div>
            <p>Total: {{total}}</p>
          </form>
        </div>
      </div>`,
    data: function () {
        return {
            type: null as string | null,
            athlete: null as string | null,
            country: null as string | null,
            total: null as number | null,
        };
    },
    beforeMount() {
        const data = this.params.api!.getDisplayedRowAtIndex(this.params.rowIndex!)!.data;
        this.type = this.params.type || 'primary';
        this.athlete = data.athlete;
        this.country = data.country;
        this.total = data.total;
    },
    methods: {
        onFormSubmit(e: Event) {
            e.preventDefault();
            const { params } = this;
            const { node } = params;

            const target = (e.target as HTMLFormElement).querySelector('input')!;

            if (target.value) {
                node!.setDataValue('athlete', target.value);
                if (this.params.hideTooltipCallback) {
                    this.params.hideTooltipCallback();
                }
            }
        },
    },
});
