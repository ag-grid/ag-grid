import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `
        <div class="custom-element">
            <button>Age: {{ params.data.age ? params.data.age : '?' }}</button>
            <input value="{{ params.data.country ? params.data.country : '' }}" />
            <a href="https://www.google.com/search?q={{ params.data.sport }}" target="_blank">{{
                params.data.sport
            }}</a>
        </div>
    `,
})
export class CustomElements implements ICellRendererAngularComp {
    public params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
