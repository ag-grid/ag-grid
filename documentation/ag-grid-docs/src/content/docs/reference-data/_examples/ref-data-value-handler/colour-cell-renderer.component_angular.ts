import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
@Component({
    standalone: true,
    template: `
        @if (params.value === '(Select All)') {
            <div>{{ params.value }}</div>
        } @else {
            <span [style.color]="removeSpaces(params.valueFormatted)">{{ params.valueFormatted }}</span>
        }
    `,
})
export class ColourCellRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh() {
        return false;
    }

    removeSpaces(str: string) {
        return str ? str.replace(/\s/g, '') : str;
    }
}
