import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { IHeaderAngularComp } from 'ag-grid-angular';
import type { IHeaderParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="custom-header">
            <span>{{ displayName() }}</span>
            <button>Click me</button>
            <input value="120" />
            <a href="https://www.ag-grid.com" target="_blank">Link</a>
        </div>
    `,
})
export class CustomHeader implements IHeaderAngularComp {
    displayName = signal<string>('');

    agInit(params: IHeaderParams): void {
        this.displayName.set(params.displayName);
    }

    refresh(params: IHeaderParams) {
        this.displayName.set(params.displayName);
        return true;
    }
}
