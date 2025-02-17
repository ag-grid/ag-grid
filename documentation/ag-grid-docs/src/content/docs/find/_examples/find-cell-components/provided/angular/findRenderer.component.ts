import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span>
            @for (part of parts(); track $index) {
                @if (part.match) {
                    <mark [class]="{ 'ag-find-match': true, 'ag-find-active-match': part.activeMatch }">{{
                        part.value
                    }}</mark>
                } @else {
                    <ng-container>{{ part.value }}</ng-container>
                }
            }
        </span>
    `,
})
export class FindRenderer implements ICellRendererAngularComp {
    parts = signal<any[]>([]);

    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    refresh(params: ICellRendererParams): boolean {
        const { api, value, valueFormatted, column, node } = params;
        const cellValue = valueFormatted ?? value?.toString();
        if (cellValue == null || cellValue === '') {
            this.parts.set([]);
            return true;
        }
        const cellDisplayValue = `Year is ${cellValue}`;
        const parts =
            column != null
                ? api.findGetParts({
                      value: cellDisplayValue,
                      node,
                      column,
                  })
                : [];
        this.parts.set(parts.length ? parts : [{ value: cellDisplayValue }]);
        return true;
    }
}
