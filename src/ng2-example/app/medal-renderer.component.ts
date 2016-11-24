import {Component} from '@angular/core';

import {AgRendererComponent} from 'ag-grid-ng2/main';

@Component({
    selector: 'group-row-cell',
    template: `{{country}} Gold: {{gold}}, Silver: {{silver}}, Bronze: {{bronze}}`
})
export class MedalRendererComponent implements AgRendererComponent {
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