import {Component} from "@angular/core";

import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'full-width-cell',
    template: `<div class="full-width-cell">Full Width Row. Row Values: {{ values }}</div>`,
    styles: [`
        .full-width-cell {
            border: 2px solid #22ff22;
            border-radius: 5px;
            background-color: #bbffbb;
        }
    `]
})
export class NameAndAgeRendererComponent implements ICellRendererAngularComp {
    private params: any;
    public values: string;

    agInit(params: any): void {
        this.params = params;
        this.values = `Name: ${params.data.name}, Age: ${params.data.age}`
    }

    refresh(): boolean {
        return false;
    }
}
