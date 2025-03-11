import { getFileCssIcon } from './fileUtils';

export default {
    template: `
        <span className="filename">
            <i :class="fileIconClass"></i>
            {{ value }}
        </span>
    `,
    data: function () {
        return { value: '', fileIconClass: '' };
    },
    beforeMount() {
        this.updateDisplay(this.params);
    },
    methods: {
        refresh(params) {
            this.updateDisplay(params);
        },
        updateDisplay(params) {
            this.value = params.value;
            this.fileIconClass = getFileCssIcon(params.data.type, params.value);
        },
    },
};
