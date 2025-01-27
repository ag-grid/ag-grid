import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="custom-element">
            <button>Age: {{ data()?.age ?? '?' }}</button>
            <input value="{{ data()?.country ?? '' }}" />
            <a href="https://www.google.com/search?q={{ data()?.sport }}" target="_blank">{{ data()?.sport }}</a>
        </div>
    `,
})
export class CustomElements implements ICellRendererAngularComp {
    data = signal<any | undefined>(undefined);

    agInit(params: ICellRendererParams): void {
        this.data.set(params.data);
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
