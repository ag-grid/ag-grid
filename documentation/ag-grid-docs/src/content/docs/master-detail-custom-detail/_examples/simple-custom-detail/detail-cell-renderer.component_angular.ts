import { ChangeDetectionStrategy, Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div role="gridcell"><h1 style="padding: 20px;">My Custom Detail</h1></div>`,
})
export class DetailCellRenderer implements ICellRendererAngularComp {
    agInit(params: any): void {}

    refresh(params: any): boolean {
        return false;
    }
}
