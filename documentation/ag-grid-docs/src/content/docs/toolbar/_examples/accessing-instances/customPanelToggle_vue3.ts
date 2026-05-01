export default {
    template: `
        <button
            class="ag-toolbar-item ag-toolbar-button"
            type="button"
            :title="options.label"
            :aria-label="options.label"
            :style="active ? { backgroundColor: 'var(--ag-button-background-color)' } : {}"
            @click="toggle"
        >
            <span :class="['ag-icon', 'ag-icon-' + options.icon]" aria-hidden="true"></span>
            <span>{{ options.label }}</span>
        </button>
    `,
    data() {
        return { active: false, options: {} };
    },
    methods: {
        // Public method, accessible via api.getToolbarItemInstance(key).
        toggle() {
            const { panelId } = this.options;
            if (this.params.api.getOpenedToolPanel() === panelId) {
                this.params.api.closeToolPanel();
            } else {
                this.params.api.openToolPanel(panelId);
            }
        },
        onPanelVisibleChanged({ key, visible }) {
            if (key === this.options.panelId) {
                this.active = visible;
            } else if (visible) {
                this.active = false;
            }
        },
    },
    mounted() {
        this.options = this.params.toolbarItemParams;
        this.params.api.addEventListener('toolPanelVisibleChanged', this.onPanelVisibleChanged);
    },
    beforeUnmount() {
        this.params.api.removeEventListener('toolPanelVisibleChanged', this.onPanelVisibleChanged);
    },
};
