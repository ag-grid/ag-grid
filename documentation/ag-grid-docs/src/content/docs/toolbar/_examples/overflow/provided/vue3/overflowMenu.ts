export default {
    template: `
        <div class="ag-toolbar-item overflow-menu-wrapper" style="position: relative">
            <button class="ag-toolbar-button" title="More actions" aria-label="More actions" @click="toggleMenu">
                ☰
            </button>
            <div
                class="overflow-menu"
                :style="menuStyle"
            >
                <div
                    v-for="item in actions"
                    :key="item.label"
                    class="overflow-menu-item"
                    style="padding:6px 12px;cursor:pointer;white-space:nowrap;font-size:var(--ag-font-size,13px);color:var(--ag-text-color,#333)"
                    @mouseenter="$event.target.style.backgroundColor = 'var(--ag-row-hover-color, #f0f0f0)'"
                    @mouseleave="$event.target.style.backgroundColor = ''"
                    @click="item.action(); closeMenu()"
                >
                    {{ item.label }}
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            isOpen: false,
            actions: [] as { label: string; action: () => void }[],
            outsideClickListener: null as any,
        };
    },
    computed: {
        menuStyle() {
            return {
                display: this.isOpen ? 'block' : 'none',
                position: 'absolute',
                top: '100%',
                right: '0',
                zIndex: 10,
                minWidth: '180px',
                padding: '4px 0',
                background: 'var(--ag-background-color, #fff)',
                border: '1px solid var(--ag-border-color, #ccc)',
                borderRadius: 'var(--ag-border-radius, 4px)',
                boxShadow: '0 2px 8px rgba(0,0,0,.15)',
            };
        },
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
            { label: 'Column Chooser', action: () => this.params.api.showColumnChooser() },
            {
                label: 'Toggle Columns Panel',
                action: () => {
                    if (this.params.api.getOpenedToolPanel() === 'columns') {
                        this.params.api.closeToolPanel();
                    } else {
                        this.params.api.openToolPanel('columns');
                    }
                },
            },
            {
                label: 'Toggle Filters Panel',
                action: () => {
                    if (this.params.api.getOpenedToolPanel() === 'filters-new') {
                        this.params.api.closeToolPanel();
                    } else {
                        this.params.api.openToolPanel('filters-new');
                    }
                },
            },
        ];

        this.outsideClickListener = (e: MouseEvent) => {
            if (this.isOpen && !(e.target as HTMLElement).closest('.overflow-menu-wrapper')) {
                this.closeMenu();
            }
        };
        document.addEventListener('click', this.outsideClickListener);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.outsideClickListener);
    },
};
