import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { FilterChangedEvent, IToolbarItemParams } from 'ag-grid-community';

const COLUMNS = [
    { column: 'gold', label: 'Gold winners only' },
    { column: 'silver', label: 'Silver winners only' },
];

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="ag-toolbar-item" style="display: flex; gap: 12px; padding: 8px;">
            @for (option of options; track option.column) {
                <label style="display: inline-flex; align-items: center; gap: 4px; padding: 0 4px;">
                    <input
                        type="checkbox"
                        [checked]="checked[option.column]"
                        (change)="onChange(option.column, $event)"
                        style="margin: 0;"
                    />
                    {{ option.label }}
                </label>
            }
        </div>
    `,
})
export class WinnersToggle implements IToolbarItemAngularComp, OnDestroy {
    private params!: IToolbarItemParams;
    options = COLUMNS;
    checked: Record<string, boolean> = {};

    constructor(private cdr: ChangeDetectorRef) {}

    private filterListener = (_event: FilterChangedEvent) => {
        for (const { column } of COLUMNS) {
            this.checked[column] = this.params.api.getColumnFilterModel(column) != null;
        }
        this.cdr.markForCheck();
    };

    agInit(params: IToolbarItemParams): void {
        this.params = params;
        params.api.addEventListener('filterChanged', this.filterListener);
    }

    onChange(column: string, event: Event): void {
        const next = (event.target as HTMLInputElement).checked;
        const model = next ? { type: 'greaterThan', filter: 0 } : null;
        this.params.api.setColumnFilterModel(column, model).then(() => this.params.api.onFilterChanged());
    }

    ngOnDestroy(): void {
        this.params.api.removeEventListener('filterChanged', this.filterListener);
    }
}
