import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div>
            <div :class="show-name">
                {{ showName() }}
            </div>
            <div :class="show-presenter">
                {{ presenterName() }}
            </div>
        </div>
    `,
})
export class ShowCellRenderer implements ICellRendererAngularComp {
    showName = signal('');
    presenterName = signal('');

    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    refresh(params: ICellRendererParams): boolean {
        if (!params.value) {
            return true;
        }
        this.showName.set(params.value.name);
        this.presenterName.set(params.value.presenter);
        return true;
    }
}
