import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { IToolbarItemParams } from 'ag-grid-community';

const COLUMNS = [
    { column: 'gold', label: 'Gold winners only' },
    { column: 'silver', label: 'Silver winners only' },
];

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IToolbarItemParams>,
            required: true,
        },
    },
    template: `
        <div class="ag-toolbar-item winners-toggle">
            <label v-for="option in options" :key="option.column" class="winners-toggle-item">
                <input
                    type="checkbox"
                    :checked="checked[option.column]"
                    @change="onChange(option.column, $event)"
                />
                {{ option.label }}
            </label>
        </div>
    `,
    data() {
        return {
            options: COLUMNS,
            checked: { gold: false, silver: false } as Record<string, boolean>,
        };
    },
    methods: {
        onChange(column: string, event: Event) {
            const next = (event.target as HTMLInputElement).checked;
            const model = next ? { type: 'greaterThan', filter: 0 } : null;
            this.params.api.setColumnFilterModel(column, model).then(() => this.params.api.onFilterChanged());
        },
        onFilterChanged() {
            for (const { column } of COLUMNS) {
                this.checked[column] = this.params.api.getColumnFilterModel(column) != null;
            }
        },
    },
    mounted() {
        this.params.api.addEventListener('filterChanged', this.onFilterChanged);
    },
    beforeUnmount() {
        this.params.api.removeEventListener('filterChanged', this.onFilterChanged);
    },
});
