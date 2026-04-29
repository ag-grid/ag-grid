export default {
    template: `
        <button
            class="ag-toolbar-item ag-toolbar-button"
            type="button"
            :title="tooltip"
            :aria-label="tooltip"
            :style="active ? { backgroundColor: 'var(--ag-button-background-color)' } : {}"
            @click="onClick"
        >
            <span :class="['ag-icon', 'ag-icon-' + options.icon]" aria-hidden="true"></span>
            <span v-if="options.label">{{ options.label }}</span>
        </button>
    `,
    data() {
        return { active: false, options: {} };
    },
    computed: {
        tooltip() {
            return this.options.title ?? this.options.label ?? '';
        },
    },
    methods: {
        onClick() {
            this.options.onClick(this.params.api);
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
