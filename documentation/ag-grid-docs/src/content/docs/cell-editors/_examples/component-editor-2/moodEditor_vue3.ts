import { defineComponent, nextTick } from 'vue';
import type { PropType } from 'vue';

import type { ICellEditorParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<ICellEditorParams>,
            required: true,
        },
    },
    template: `
      <div :ref="'container'" class="mood" tabindex="0" @keydown="onKeyDown">
      <img src="https://www.ag-grid.com/example-assets/smileys/happy.png" @click="onClick(true)" :class="{ selected: happy, default: !happy }">
      <img src="https://www.ag-grid.com/example-assets/smileys/sad.png" @click="onClick(false)" :class="{ selected: !happy, default: happy }">
      </div>
    `,
    data() {
        return {
            happy: false,
            imgForMood: null,
        };
    },
    methods: {
        getValue(): string {
            return this.happy ? 'Happy' : 'Sad';
        },

        isPopup() {
            return true;
        },

        setHappy(happy: boolean) {
            this.happy = happy;
        },

        toggleMood() {
            this.setHappy(!this.happy);
        },

        onClick(happy: boolean) {
            this.setHappy(happy);
            this.params.stopEditing();
        },

        onKeyDown(event: KeyboardEvent) {
            const key = event.key;
            if (
                key == 'ArrowLeft' || // left
                key == 'ArrowRight'
            ) {
                // right
                this.toggleMood();
                event.stopPropagation();
            }
        },
    },
    created() {
        this.setHappy(this.params.value === 'Happy');
    },
    mounted() {
        nextTick(() => {
            (this.$refs.container as HTMLElement).focus();
        });
    },
});
