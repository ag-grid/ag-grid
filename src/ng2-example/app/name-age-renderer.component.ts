import {Component} from '@angular/core';

import {AgRendererComponent} from 'ag-grid-ng2/main';

@Component({
    selector: 'full-width-cell',
    template: `<span>Full Width Column! {{ values }}</span>`
})
export class NameAndAgeRendererComponent implements AgRendererComponent {
    private params: any;
    public values: string;

    agInit(params: any): void {
        this.params = params;
        this.values = `Name: ${params.data.name}, Age: ${params.data.age}`
    }
}
