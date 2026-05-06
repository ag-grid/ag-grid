const PANELS = [
    { value: 'filters', label: 'Filters' },
    { value: 'columns', label: 'Columns' },
    { value: 'none', label: 'None' },
];

export default {
    template: `
        <div class="ag-toolbar-item" role="radiogroup" style="display: flex; gap: 12px; padding: 10px; align-items: center;">
            <span>Tool Panel:</span>
            <label v-for="option in options" :key="option.value" style="display: inline-flex; align-items: center; gap: 4px; padding: 0 4px;">
                <input
                    type="radio"
                    :name="groupName"
                    :value="option.value"
                    :checked="selected === option.value"
                    @change="onChange(option.value)"
                    style="margin: 0;"
                />
                {{ option.label }}
            </label>
        </div>
    `,
    data() {
        return {
            options: PANELS,
            groupName: '',
            selected: 'none',
        };
    },
    methods: {
        onChange(value) {
            if (value === 'none') {
                this.params.api.closeToolPanel();
            } else {
                this.params.api.openToolPanel(value);
            }
        },
        // Public method, called externally via api.getToolbarItemInstance(key).
        setSelected(value) {
            this.selected = value;
        },
    },
    mounted() {
        this.groupName = `tool-panel-${this.params.key}`;
    },
};
