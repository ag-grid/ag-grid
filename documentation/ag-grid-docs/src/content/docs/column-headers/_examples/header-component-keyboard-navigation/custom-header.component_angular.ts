import { Component } from '@angular/core';

import type { IHeaderAngularComp } from 'ag-grid-angular';
import type { IHeaderParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `
        <div class="custom-header">
            <span>{{ params.displayName }}</span>
            <button>Click me</button>
            <input value="120" />
            <a href="https://www.ag-grid.com" target="_blank">Link</a>
        </div>
    `,
})
export class CustomHeader implements IHeaderAngularComp {
    public params!: IHeaderParams;

    agInit(params: IHeaderParams): void {
        this.params = params;
    }

    refresh(params: IHeaderParams) {
        return false;
    }
}
