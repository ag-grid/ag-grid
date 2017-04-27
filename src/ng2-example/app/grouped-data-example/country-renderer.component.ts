import {Component} from "@angular/core";

import {ICellRendererAngularComp} from "ag-grid-angular/main";

@Component({
    selector: 'country-cell',
    template: `
        <img border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/{{flag}}.png">{{flag}}
    `
})
export class CountryRendererComponent implements ICellRendererAngularComp {
    private params: any;
    public flag: string;

    agInit(params: any): void {
        this.params = params;
        this.flag = this.COUNTRY_CODES[params.value];
    }

    private COUNTRY_CODES = {
        Ireland: "ie",
        Luxembourg: "lu",
        Belgium: "be",
        Spain: "es",
        "United Kingdom": "gb",
        France: "fr",
        Germany: "de",
        Sweden: "se",
        Italy: "it",
        Greece: "gr",
        Iceland: "is",
        Portugal: "pt",
        Malta: "mt",
        Norway: "no",
        Brazil: "br",
        Argentina: "ar",
        Colombia: "co",
        Peru: "pe",
        Venezuela: "ve",
        Uruguay: "uy"
    };
}