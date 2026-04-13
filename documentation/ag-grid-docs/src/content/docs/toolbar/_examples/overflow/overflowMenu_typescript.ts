import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';

export class OverflowMenu implements IToolbarItemComp {
    private eGui!: HTMLDivElement;
    private eButton!: HTMLButtonElement;
    private eMenu!: HTMLDivElement;
    private isOpen = false;
    private outsideClickListener: any;

    init(params: IToolbarItemParams) {
        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-toolbar-item overflow-menu-wrapper';
        this.eGui.style.position = 'relative';

        this.eButton = document.createElement('button');
        this.eButton.className = 'ag-toolbar-button';
        this.eButton.textContent = '☰';
        this.eButton.title = 'More actions';
        this.eButton.setAttribute('aria-label', 'More actions');
        this.eButton.setAttribute('aria-haspopup', 'true');
        this.eButton.setAttribute('aria-expanded', 'false');
        this.eButton.addEventListener('click', () => this.toggleMenu());
        this.eButton.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openMenu();
            }
        });
        this.eGui.appendChild(this.eButton);

        this.eMenu = document.createElement('div');
        this.eMenu.className = 'overflow-menu';
        this.eMenu.setAttribute('role', 'menu');
        this.eMenu.style.cssText =
            'display:none;position:absolute;top:100%;right:0;z-index:10;min-width:180px;padding:4px 0;background:var(--ag-background-color,#fff);border:1px solid var(--ag-border-color,#ccc);border-radius:var(--ag-border-radius,4px);box-shadow:0 2px 8px rgba(0,0,0,.15);';
        this.eMenu.addEventListener('keydown', (e) => this.handleMenuKeyDown(e));
        this.eGui.appendChild(this.eMenu);

        this.outsideClickListener = (e: MouseEvent) => {
            if (this.isOpen && !this.eGui.contains(e.target as Node)) {
                this.closeMenu();
            }
        };
        document.addEventListener('click', this.outsideClickListener);

        const actions = [
            { label: 'Column Chooser', action: () => params.api.showColumnChooser() },
            { label: 'Auto Size Columns', action: () => params.api.autoSizeAllColumns() },
            {
                label: 'Toggle Columns Panel',
                action: () => {
                    if (params.api.getOpenedToolPanel() === 'columns') {
                        params.api.closeToolPanel();
                    } else {
                        params.api.openToolPanel('columns');
                    }
                },
            },
            {
                label: 'Toggle Filters Panel',
                action: () => {
                    const id = params.api.getOpenedToolPanel() === 'filters-new' ? null : 'filters-new';
                    if (id) {
                        params.api.openToolPanel(id);
                    } else {
                        params.api.closeToolPanel();
                    }
                },
            },
            { label: 'Export CSV', action: () => params.api.exportDataAsCsv() },
            { label: 'Export Excel', action: () => params.api.exportDataAsExcel() },
            { label: 'Reset Columns', action: () => params.api.resetColumnState() },
        ];

        for (const item of actions) {
            const eItem = document.createElement('div');
            eItem.className = 'overflow-menu-item';
            eItem.setAttribute('role', 'menuitem');
            eItem.setAttribute('tabindex', '-1');
            eItem.style.cssText =
                'padding:6px 12px;cursor:pointer;white-space:nowrap;font-size:var(--ag-font-size,13px);color:var(--ag-text-color,#333);';
            eItem.textContent = item.label;
            eItem.addEventListener('mouseenter', () => {
                eItem.style.backgroundColor = 'var(--ag-row-hover-color, #f0f0f0)';
            });
            eItem.addEventListener('mouseleave', () => {
                eItem.style.backgroundColor = '';
            });
            eItem.addEventListener('click', () => {
                item.action();
                this.closeMenu();
            });
            this.eMenu.appendChild(eItem);
        }
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        document.removeEventListener('click', this.outsideClickListener);
    }

    private getVisibleMenuItems(): HTMLElement[] {
        return Array.from(this.eMenu.querySelectorAll<HTMLElement>('.overflow-menu-item')).filter(
            (el) => getComputedStyle(el).display !== 'none'
        );
    }

    private handleMenuKeyDown(e: KeyboardEvent): void {
        const items = this.getVisibleMenuItems();
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
                this.eButton.focus();
                break;
            }
            case 'Enter':
            case ' ': {
                e.preventDefault();
                (e.target as HTMLElement).click();
                break;
            }
        }
    }

    private toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    private openMenu() {
        this.eMenu.style.display = 'block';
        this.eButton.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
        const items = this.getVisibleMenuItems();
        items[0]?.focus();
    }

    private closeMenu() {
        this.eMenu.style.display = 'none';
        this.eButton.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
    }
}
