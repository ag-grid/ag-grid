export default {
    template: `
        <div class="ag-toolbar-item overflow-menu-wrapper" style="position: relative">
            <button
                ref="menuButton"
                class="ag-toolbar-button"
                title="More actions"
                aria-label="More actions"
                aria-haspopup="true"
                :aria-expanded="isOpen"
                @click="toggleMenu"
                @keydown="handleButtonKeyDown"
            >
                ☰
            </button>
            <div
                ref="menu"
                class="overflow-menu"
                role="menu"
                :style="menuStyle"
                @keydown="handleMenuKeyDown"
            >
                <div
                    v-for="item in actions"
                    :key="item.label"
                    class="overflow-menu-item"
                    role="menuitem"
                    tabindex="-1"
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
        getVisibleItems(): HTMLElement[] {
            const menuEl = this.$refs.menu as HTMLElement;
            if (!menuEl) return [];
            return Array.from(menuEl.querySelectorAll<HTMLElement>('.overflow-menu-item')).filter(
                (el) => getComputedStyle(el).display !== 'none'
            );
        },
        handleButtonKeyDown(e: KeyboardEvent) {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openMenu();
            }
        },
        handleMenuKeyDown(e: KeyboardEvent) {
            const items = this.getVisibleItems();
            const currentIndex = items.indexOf(e.target as HTMLElement);

            switch (e.key) {
                case 'ArrowDown': {
                    e.preventDefault();
                    const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                    items[next].focus();
                    break;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                    items[prev].focus();
                    break;
                }
                case 'Home': {
                    e.preventDefault();
                    items[0]?.focus();
                    break;
                }
                case 'End': {
                    e.preventDefault();
                    items[items.length - 1]?.focus();
                    break;
                }
                case 'Escape': {
                    e.preventDefault();
                    this.closeMenu();
                    (this.$refs.menuButton as HTMLElement).focus();
                    break;
                }
                case 'Enter':
                case ' ': {
                    e.preventDefault();
                    (e.target as HTMLElement).click();
                    break;
                }
            }
        },
        toggleMenu() {
            if (this.isOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        },
        openMenu() {
            this.isOpen = true;
            this.$nextTick(() => {
                const items = this.getVisibleItems();
                items[0]?.focus();
            });
        },
        closeMenu() {
            this.isOpen = false;
        },
    },
    created() {
        this.actions = [
            { label: 'Column Chooser', action: () => this.params.api.showColumnChooser() },
            { label: 'Auto Size Columns', action: () => this.params.api.autoSizeAllColumns() },
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
            { label: 'Export CSV', action: () => this.params.api.exportDataAsCsv() },
            { label: 'Export Excel', action: () => this.params.api.exportDataAsExcel() },
            { label: 'Reset Columns', action: () => this.params.api.resetColumnState() },
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
