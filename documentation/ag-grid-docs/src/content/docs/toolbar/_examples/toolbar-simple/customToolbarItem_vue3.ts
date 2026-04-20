export default {
    template: `
        <button
            class="ag-toolbar-item ag-toolbar-button"
            type="button"
            :title="params.label"
            :aria-label="params.label"
            @click="onClick"
        >
            {{ params.label }}
        </button>
    `,
    methods: {
        onClick() {
            this.params.onClick(this.params.api);
        },
    },
};
