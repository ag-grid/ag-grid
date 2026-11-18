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
      <div draggable="true" v-on:dragstart="onDragStart">Drag Me!</div>
    `,
    data: function () {
        return {};
    },
    methods: {
        onDragStart(event: DragEvent) {
            event.dataTransfer!.setData('text/plain', 'Dragged item with ID: ' + this.params.node.data.id);
        },
    },
});
