import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { getFileCssIcon } from './fileUtils';
import type { IFile } from './fileUtils';

export interface FileCellRendererParams {
    value: string;
    data: IFile;
}

export default defineComponent({
    props: {
        params: Object as PropType<FileCellRendererParams | undefined>,
    },
    template: `
        <span class="filename">
            <i :class="fileIconClass"></i>
            {{ value }}
        </span>
    `,
    data() {
        return {
            value: '',
            fileIconClass: '',
        };
    },
    mounted() {
        if (this.params) {
            this.updateDisplay(this.params);
        }
    },
    methods: {
        refresh(params: FileCellRendererParams) {
            this.updateDisplay(params);
        },
        updateDisplay(params: FileCellRendererParams) {
            this.value = params.value;
            this.fileIconClass = getFileCssIcon(params.data.type, params.value);
        },
    },
});
