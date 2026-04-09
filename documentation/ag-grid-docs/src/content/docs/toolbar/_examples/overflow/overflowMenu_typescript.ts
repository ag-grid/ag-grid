import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';

interface OverflowAction {
    label: string;
    action: () => void;
}

export class OverflowMenu implements IToolbarItemComp {
    private params!: IToolbarItemParams;
    private eGui!: HTMLDivElement;
    private eButton!: HTMLButtonElement;
    private eMenu!: HTMLDivElement;
    private actions: OverflowAction[] = [];
    private isOpen = false;
    private outsideClickListener: any;

    init(params: IToolbarItemParams) {
        this.params = params;

        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-toolbar-item overflow-menu-wrapper';
        this.eGui.style.position = 'relative';

        this.eButton = document.createElement('button');
        this.eButton.className = 'ag-toolbar-button';
        this.eButton.textContent = '☰';
        this.eButton.title = 'More actions';
        this.eButton.setAttribute('aria-label', 'More actions');
        this.eButton.addEventListener('click', () => this.toggleMenu());
        this.eGui.appendChild(this.eButton);

        this.eMenu = document.createElement('div');
        this.eMenu.className = 'overflow-menu';
        this.eMenu.style.cssText =
            'display:none;position:fixed;z-index:10;min-width:180px;padding:4px 0;background:var(--ag-background-color,#fff);border:1px solid var(--ag-border-color,#ccc);border-radius:var(--ag-border-radius,4px);box-shadow:0 2px 8px rgba(0,0,0,.15);';
        document.body.appendChild(this.eMenu);

        this.outsideClickListener = (e: MouseEvent) => {
            if (this.isOpen && !this.eGui.contains(e.target as Node) && !this.eMenu.contains(e.target as Node)) {
                this.closeMenu();
            }
        };
        document.addEventListener('click', this.outsideClickListener);

        this.actions = [
            { label: 'Export CSV', action: () => params.api.exportDataAsCsv() },
            { label: 'Export Excel', action: () => params.api.exportDataAsExcel() },
            { label: 'Auto Size Columns', action: () => params.api.autoSizeAllColumns() },
            { label: 'Reset Columns', action: () => params.api.resetColumnState() },
            { label: 'Column Chooser', action: () => params.api.showColumnChooser() },
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
        ];

        this.buildMenu();
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        document.removeEventListener('click', this.outsideClickListener);
        this.eMenu.remove();
    }

    private buildMenu() {
        this.eMenu.innerHTML = '';
        for (const item of this.actions) {
            const eItem = document.createElement('div');
            eItem.className = 'overflow-menu-item';
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

    private toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    private openMenu() {
        const rect = this.eButton.getBoundingClientRect();
        this.eMenu.style.top = `${rect.bottom}px`;
        this.eMenu.style.right = `${document.documentElement.clientWidth - rect.right}px`;
        this.eMenu.style.display = 'block';
        this.isOpen = true;
    }

    private closeMenu() {
        this.eMenu.style.display = 'none';
        this.isOpen = false;
    }
}
