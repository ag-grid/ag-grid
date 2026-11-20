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
    data() {
        return {
            isGroup: undefined as boolean | undefined,
            paddingLeft: null as string | null,
            rotation: null as string | null,
        };
    },
    template: `
        <div
            :style="{ paddingLeft: paddingLeft }"
        >
            <div
                v-if="isGroup"
                :style="{ transform: rotation, cursor: 'pointer', display: 'inline-block' }"
                @click="onExpand"
            >
                &rarr;
            </div>
            &nbsp;
            {{params.value}}
        </div>
    `,
    methods: {
        onExpand() {
            this.params.node.setExpanded(!this.params.node.expanded);
        },
    },
    beforeMount() {
        this.isGroup = this.params.node.group;
        this.paddingLeft = `${this.params.node.level * 15}px`;
        this.rotation = this.params.node.expanded ? 'rotate(90deg)' : 'rotate(0deg)';
    },
});
