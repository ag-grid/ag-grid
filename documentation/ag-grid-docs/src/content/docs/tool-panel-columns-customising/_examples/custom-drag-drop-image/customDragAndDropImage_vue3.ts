import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { IDragAndDropImageParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IDragAndDropImageParams & { accentColour: string }>,
            required: true,
        },
    },
    template: `
        <div class="my-custom-drag-and-drop-cover" ref="eImage">
            <i class="fas fa-2x" ref="eIcon"></i>
            <div ref="eLabel"></div>
        </div>
    `,
    mounted() {
        (this.$refs.eImage as HTMLElement).style.setProperty('background-color', this.params.accentColour);
    },
    methods: {
        setLabel(label: string) {
            (this.$refs.eLabel as HTMLElement).innerHTML = label;
        },

        setIcon(icon: string | null) {
            const { dragSource, api } = this.params;
            const eIcon = this.$refs.eIcon as HTMLElement;

            if (!icon) {
                icon = dragSource.getDefaultIconName ? dragSource.getDefaultIconName() : 'notAllowed';
            }

            if (icon === 'hide' && api.getGridOption('suppressDragLeaveHidesColumns')) {
                return;
            }

            eIcon.classList.toggle('fa-hand-point-left', icon === 'left');
            eIcon.classList.toggle('fa-hand-point-right', icon === 'right');
            eIcon.classList.toggle('fa-mask', icon === 'hide');
            eIcon.classList.toggle('fa-ban', icon === 'notAllowed');
            eIcon.classList.toggle('fa-thumbtack', icon === 'pinned');
            eIcon.classList.toggle('fa-walking', icon === 'move');
            eIcon.classList.toggle('fa-layer-group', icon === 'group');
            eIcon.classList.toggle('fa-table', icon === 'aggregate');
            eIcon.classList.toggle('fa-ruler-combined', icon === 'pivot');
        },
    },
});
