import {Component} from "@angular/core";

import {AgRendererComponent} from "@ag-grid-community/angular";
import {ICellRendererParams} from "@ag-grid-community/core";

@Component({
    selector: 'day-component',
    template: `<span><img *ngFor="let number of value" [src]="rendererImage"/></span>`
})
export class DaysFrostRenderer implements AgRendererComponent {
    params: ICellRendererParams;
    rendererImage: string;
    value: any[];

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.updateImage();
    }

    updateImage() {
        this.rendererImage = `https://www.ag-grid.com/example-assets/weather/${this.params.rendererImage}`;
        this.value = new Array(this.params.value).fill(0);
    }

    refresh(params: ICellRendererParams) {
        this.params = params;
        this.updateImage();
    }
}
