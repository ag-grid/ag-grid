export default {
    template: `
        <div class="ag-toolbar-item overflow-menu-wrapper">
            <button ref="menuButton" class="ag-toolbar-button" title="More actions" aria-label="More actions" @click="toggleMenu">
                ☰
            </button>
        </div>
    `,
    data() {
        return {
            isOpen: false,
            actions: [] as { label: string; action: () => void }[],
            eMenu: null as HTMLDivElement | null,
            outsideClickListener: null as any,
        };
    },
    methods: {
        toggleMenu() {
            if (this.isOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        },
        openMenu() {
            const rect = (this.$refs.menuButton as HTMLButtonElement).getBoundingClientRect();
            this.eMenu!.style.top = `${rect.bottom}px`;
            this.eMenu!.style.right = `${document.documentElement.clientWidth - rect.right}px`;
            this.eMenu!.style.display = 'block';
            this.isOpen = true;
        },
        closeMenu() {
            this.eMenu!.style.display = 'none';
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

        this.eMenu = document.createElement('div');
        this.eMenu.className = 'overflow-menu';
        this.eMenu.style.cssText =
            'display:none;position:fixed;z-index:10;min-width:180px;padding:4px 0;background:var(--ag-background-color,#fff);border:1px solid var(--ag-border-color,#ccc);border-radius:var(--ag-border-radius,4px);box-shadow:0 2px 8px rgba(0,0,0,.15);';
        document.body.appendChild(this.eMenu);

        for (const item of this.actions) {
            const eItem = document.createElement('div');
            eItem.className = 'overflow-menu-item';
            eItem.style.cssText =
                'padding:6px 12px;cursor:pointer;white-space:nowrap;font-size:var(--ag-font-size,13px);color:var(--ag-text-color,#333);';
            eItem.textContent = item.label;
            eItem.addEventListener(
                'mouseenter',
                () => (eItem.style.backgroundColor = 'var(--ag-row-hover-color, #f0f0f0)')
            );
            eItem.addEventListener('mouseleave', () => (eItem.style.backgroundColor = ''));
            eItem.addEventListener('click', () => {
                item.action();
                this.closeMenu();
            });
            this.eMenu.appendChild(eItem);
        }

        this.outsideClickListener = (e: MouseEvent) => {
            if (
                this.isOpen &&
                !(this.$refs.menuButton as HTMLElement)?.contains(e.target as Node) &&
                !this.eMenu!.contains(e.target as Node)
            ) {
                this.closeMenu();
            }
        };
        document.addEventListener('click', this.outsideClickListener);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.outsideClickListener);
        this.eMenu?.remove();
    },
};
