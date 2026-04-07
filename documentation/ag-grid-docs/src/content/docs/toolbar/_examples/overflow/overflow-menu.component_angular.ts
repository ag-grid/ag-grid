import { ChangeDetectionStrategy, Component } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { IToolbarItemParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="ag-toolbar-item" style="position: relative">
            <button class="ag-toolbar-button" title="More actions" aria-label="More actions" (click)="toggleMenu()">
                ⋯
            </button>
            <div
                *ngIf="isOpen"
                class="overflow-menu"
                style="position:absolute;top:100%;right:0;z-index:10;min-width:160px;padding:4px 0;background:var(--ag-background-color,#fff);border:1px solid var(--ag-border-color,#ccc);border-radius:var(--ag-border-radius,4px);box-shadow:0 2px 8px rgba(0,0,0,.15);"
            >
                <div
                    *ngFor="let item of actions"
                    class="overflow-menu-item"
                    style="padding:6px 12px;cursor:pointer;white-space:nowrap;font-size:var(--ag-font-size,13px);color:var(--ag-text-color,#333);"
                    (click)="item.action(); closeMenu()"
                >
                    {{ item.label }}
                </div>
            </div>
        </div>
    `,
})
export class OverflowMenu implements IToolbarItemAngularComp {
    private params!: IToolbarItemParams;
    isOpen = false;
    actions: { label: string; action: () => void }[] = [];

    agInit(params: IToolbarItemParams): void {
        this.params = params;
        this.actions = [
            { label: 'Export CSV', action: () => params.api.exportDataAsCsv() },
            { label: 'Export Excel', action: () => params.api.exportDataAsExcel() },
            { label: 'Auto Size Columns', action: () => params.api.autoSizeAllColumns() },
            { label: 'Reset Columns', action: () => params.api.resetColumnState() },
        ];
    }

    toggleMenu(): void {
        this.isOpen = !this.isOpen;
    }

    closeMenu(): void {
        this.isOpen = false;
    }
}
