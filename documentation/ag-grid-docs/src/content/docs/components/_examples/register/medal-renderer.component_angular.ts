import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span class="total-value-renderer">
            <span>{{ country() }}</span>
            <button (click)="buttonClicked()">Push For Total</button>
        </span>
    `,
})
export class MedalRenderer implements ICellRendererAngularComp {
    public country = signal('');
    private total: string = '';

    // gets called once before the renderer is used
    agInit(params: ICellRendererParams): void {
        this.country.set(params.valueFormatted ?? params.value);
        this.total = params.data.total;
    }

    refresh(params: ICellRendererParams) {
        return false;
    }

    buttonClicked() {
        alert(`${this.total} medals won!`);
    }
}
