import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { ICellRendererParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<ICellRendererParams>,
            required: true,
        },
    },
    template: `
          <div class="my-custom-cell-renderer">
          <div class="athlete-info">
            <span>{{ athlete }}</span>
            <span>{{ country }}</span>
          </div>
          <span>{{ year }}</span>
          <i class="fas fa-arrows-alt-v" ref="myRef"></i>
          </div>`,
    data: function () {
        return {
            athlete: '',
            country: '',
            year: '',
        };
    },
    beforeMount() {
        this.athlete = this.params.data.athlete;
        this.country = this.params.data.country;
        this.year = this.params.data.year;
    },
    mounted() {
        this.params.registerRowDragger(this.$refs.myRef as HTMLElement, 0);
    },
});
