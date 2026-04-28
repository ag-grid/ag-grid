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
            <span :class="['ag-icon', 'ag-icon-' + params.icon]" aria-hidden="true"></span>
            <span v-if="params.label">{{ params.label }}</span>
        </button>
    `,
    data() {
        return { active: false };
    },
    computed: {
        tooltip() {
            return this.params.title ?? this.params.label ?? '';
        },
    },
    methods: {
        onClick() {
            this.params.onClick(this.params.api);
        },
        onPanelVisibleChanged({ key, visible }) {
            if (key === this.params.panelId) {
                this.active = visible;
            } else if (visible) {
                this.active = false;
            }
        },
    },
    mounted() {
        this.params.api.addEventListener('toolPanelVisibleChanged', this.onPanelVisibleChanged);
    },
    beforeUnmount() {
        this.params.api.removeEventListener('toolPanelVisibleChanged', this.onPanelVisibleChanged);
    },
};
