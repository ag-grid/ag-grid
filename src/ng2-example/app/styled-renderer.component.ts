import {Component} from '@angular/core';

import {AgRendererComponent} from 'ag-grid-ng2/main';

@Component({
    selector: 'floating-cell',
    template: `<span [ngStyle]="style">{{params.value}}</span>`
})
export class StyledComponent implements AgRendererComponent {
    public params: any;
    public style: string;

    agInit(params: any): void {
        this.params = params;
        this.style = this.params.style;
    }
}