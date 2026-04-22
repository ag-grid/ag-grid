export default {
    template: `
        <button
            class="ag-toolbar-item ag-toolbar-button"
            type="button"
            :title="params.label"
            :aria-label="params.label"
            @click="onClick"
        >
            <span :class="['ag-icon', 'ag-icon-' + params.icon]" aria-hidden="true"></span>
            <span v-if="params.label">{{ params.label }}</span>
        </button>
    `,
    methods: {
        onClick() {
            this.params.onClick(this.params.api);
        },
    },
};
