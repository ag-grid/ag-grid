import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { FindPart, IDetailCellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div role="gridcell">
        <h1 style="padding: 20px;">
            @for (part of parts(); track $index) {
                @if (part.match) {
                    <mark [class]="{ 'ag-find-match': true, 'ag-find-active-match': part.activeMatch }">{{
                        part.value
                    }}</mark>
                } @else {
                    <ng-container>{{ part.value }}</ng-container>
                }
            }
        </h1>
    </div>`,
})
export class DetailCellRenderer implements ICellRendererAngularComp {
    parts = signal<FindPart[]>([]);

    agInit(params: IDetailCellRendererParams): void {
        this.refresh(params);
    }

    refresh(params: IDetailCellRendererParams): boolean {
        const { api, node } = params;
        const cellDisplayValue = 'My Custom Detail';
        const parts = api.findGetParts({
            value: cellDisplayValue,
            node,
            column: null,
        });
        this.parts.set(parts.length ? parts : [{ value: cellDisplayValue }]);
        return true;
    }
}
