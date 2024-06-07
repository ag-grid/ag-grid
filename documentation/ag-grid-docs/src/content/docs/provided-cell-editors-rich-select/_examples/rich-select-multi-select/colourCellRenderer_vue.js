import { getLuma } from './color-component-helper.js';

export default {
    template: `
        <div class="custom-color-cell-renderer" :class="{'color-pill': isPill, 'color-tag': !isPill}">
            <template v-for="(value, index) in values">
                <span
                :style="{ 'background-color': isPill ? value : null, 'border-color': !isPill ? value : null }"
                :class="{ dark: isPill && getLuma(value) < 150 }">
                    {{value}}
                </span>
            </template>
        </div>
    `,
    data() {
        return {
            isPill: false,
            values: [],
        };
    },
    beforeMount() {
        const { value } = this.params;
        this.isPill = Array.isArray(value);
        this.values = (this.isPill ? value : [value]).filter((value) => value != null && value !== '');
    },
    methods: {
        getLuma(value) {
            return getLuma(value);
        },
    },
};
