export default {
    template: `
        <div class="ag-toolbar-item" style="position: relative">
            <button class="ag-toolbar-button" title="More actions" aria-label="More actions" @click="toggleMenu">
                ⋯
            </button>
            <div v-if="isOpen" class="overflow-menu"
                style="position:absolute;top:100%;right:0;z-index:10;min-width:160px;padding:4px 0;background:var(--ag-background-color,#fff);border:1px solid var(--ag-border-color,#ccc);border-radius:var(--ag-border-radius,4px);box-shadow:0 2px 8px rgba(0,0,0,.15);">
                <div v-for="item in actions" :key="item.label" class="overflow-menu-item"
                    style="padding:6px 12px;cursor:pointer;white-space:nowrap;font-size:var(--ag-font-size,13px);color:var(--ag-text-color,#333);"
                    @click="item.action(); closeMenu()">
                    {{ item.label }}
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            isOpen: false,
            actions: [] as { label: string; action: () => void }[],
        };
    },
    methods: {
        toggleMenu() {
            this.isOpen = !this.isOpen;
        },
        closeMenu() {
            this.isOpen = false;
        },
    },
    created() {
        this.actions = [
            { label: 'Export CSV', action: () => this.params.api.exportDataAsCsv() },
            { label: 'Export Excel', action: () => this.params.api.exportDataAsExcel() },
            { label: 'Auto Size Columns', action: () => this.params.api.autoSizeAllColumns() },
            { label: 'Reset Columns', action: () => this.params.api.resetColumnState() },
        ];
    },
};
