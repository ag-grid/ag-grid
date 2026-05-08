const COLUMNS = [
    { column: 'gold', label: 'Gold winners only' },
    { column: 'silver', label: 'Silver winners only' },
];

export default {
    template: `
        <div class="ag-toolbar-item" style="display: flex; gap: 12px; padding: 8px;">
            <label v-for="option in options" :key="option.column" style="display: inline-flex; align-items: center; gap: 4px; padding: 0 4px;">
                <input
                    type="checkbox"
                    :checked="checked[option.column]"
                    @change="onChange(option.column, $event)"
                    style="margin: 0;"
                />
                {{ option.label }}
            </label>
        </div>
    `,
    data() {
        return {
            options: COLUMNS,
            checked: { gold: false, silver: false },
        };
    },
    methods: {
        onChange(column, event) {
            const next = event.target.checked;
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
};
