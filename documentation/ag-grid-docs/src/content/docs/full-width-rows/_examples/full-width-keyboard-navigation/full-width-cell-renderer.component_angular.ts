import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="full-width-panel">
            <button>
                <img width="15" height="10" src="https://www.ag-grid.com/example-assets/flags/{{ data()?.code }}.png" />
            </button>
            <input value="{{ data()?.name }}" />
            <a href="https://www.google.com/search?q={{ data()?.language }}" target="_blank">{{ data()?.language }}</a>
        </div>
    `,
})
export class FullWidthCellRenderer implements ICellRendererAngularComp {
    data = signal<any>(undefined);

    agInit(params: ICellRendererParams): void {
        this.data.set(params.data);
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
