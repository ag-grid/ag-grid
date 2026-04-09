import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { IToolbarItemParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="ag-toolbar-item overflow-menu-wrapper">
            <button
                #menuButton
                class="ag-toolbar-button"
                title="More actions"
                aria-label="More actions"
                (click)="toggleMenu()"
            >
                ☰
            </button>
        </div>
    `,
})
export class OverflowMenu implements IToolbarItemAngularComp {
    @ViewChild('menuButton', { static: true }) menuButton!: ElementRef<HTMLButtonElement>;

    private params!: IToolbarItemParams;
    private eMenu!: HTMLDivElement;
    private outsideClickListener: any;
    isOpen = false;
    actions: { label: string; action: () => void }[] = [];

    agInit(params: IToolbarItemParams): void {
        this.params = params;
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
                    if (params.api.getOpenedToolPanel() === 'filters-new') {
                        params.api.closeToolPanel();
                    } else {
                        params.api.openToolPanel('filters-new');
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
                !this.menuButton.nativeElement.contains(e.target as Node) &&
                !this.eMenu.contains(e.target as Node)
            ) {
                this.closeMenu();
            }
        };
        document.addEventListener('click', this.outsideClickListener);
    }

    toggleMenu(): void {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            const rect = this.menuButton.nativeElement.getBoundingClientRect();
            this.eMenu.style.top = `${rect.bottom}px`;
            this.eMenu.style.right = `${document.documentElement.clientWidth - rect.right}px`;
            this.eMenu.style.display = 'block';
            this.isOpen = true;
        }
    }

    closeMenu(): void {
        this.eMenu.style.display = 'none';
        this.isOpen = false;
    }

    ngOnDestroy(): void {
        document.removeEventListener('click', this.outsideClickListener);
        this.eMenu.remove();
    }
}
