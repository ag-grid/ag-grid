export default {
    template: `
        <div class="ag-toolbar-item" role="radiogroup" aria-label="Tool panel">
            <label v-for="option in options" :key="option.value" style="margin-right: 8px;">
                <input
                    type="radio"
                    :name="groupName"
                    :value="option.value"
                    :checked="selected === option.value"
                    @change="onSelect(option.value)"
                    style="margin-right: 4px;"
                />
                {{ option.label }}
            </label>
        </div>
    `,
    data() {
        return {
            options: [
                { value: 'filters-new', label: 'Filters' },
                { value: 'columns', label: 'Columns' },
                { value: 'none', label: 'None' },
            ],
            groupName: '',
            selected: 'none',
        };
    },
    methods: {
        onSelect(value) {
            if (value === 'none') {
                this.params.api.closeToolPanel();
            } else {
                this.params.api.openToolPanel(value);
            }
        },
        onPanelVisibleChanged({ key, visible }) {
            if (visible) {
                this.selected = key;
            } else if (this.selected === key) {
                this.selected = 'none';
            }
        },
    },
    mounted() {
        this.groupName = `tool-panel-${this.params.key}`;
        this.params.api.addEventListener('toolPanelVisibleChanged', this.onPanelVisibleChanged);
    },
    beforeUnmount() {
        this.params.api.removeEventListener('toolPanelVisibleChanged', this.onPanelVisibleChanged);
    },
};
