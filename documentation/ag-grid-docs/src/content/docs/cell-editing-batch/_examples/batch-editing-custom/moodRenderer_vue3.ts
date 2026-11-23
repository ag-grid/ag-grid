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
    template: '<div class="mood-renderer"><img style="width: 20px;" :src="imgForMood" /></div>',
    data() {
        return {
            mood: 'Happy',
            imgForMood: null as string | null,
        };
    },
    methods: {
        refresh(params: ICellRendererParams) {
            this.setMood(params);
        },

        setMood(params: ICellRendererParams) {
            this.mood = params.value;
            this.imgForMood =
                'https://www.ag-grid.com/example-assets/smileys/' + (this.mood === 'Happy' ? 'happy.png' : 'sad.png');
        },
    },
    created() {
        this.setMood(this.params);
    },
});
