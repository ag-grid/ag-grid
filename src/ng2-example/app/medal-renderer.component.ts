import {Component} from '@angular/core';

import {ICellRendererAngularComp} from 'ag-grid-angular/main';

@Component({
    selector: 'group-row-cell',
    template: `{{country}} Gold: {{gold}}, Silver: {{silver}}, Bronze: {{bronze}}`
})
export class MedalRendererComponent implements ICellRendererAngularComp {
    private params: any;
    public country: string;
    public gold: string;
    public silver: string;
    public bronze: string;

    agInit(params: any): void {
        this.params = params;
        this.country = params.node.key;
        this.gold = params.data.gold;
        this.silver = params.data.silver;
        this.bronze = params.data.bronze;
    }
}