import { Component } from "@angular/core";

import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { ICellRendererParams } from "@ag-grid-community/core";

@Component({
    selector: 'day-component',
    template: `<span><img *ngFor="let number of value" [src]="rendererImage"/></span>`
})
export class DaysFrostRenderer implements ICellRendererAngularComp {
    params!: ICellRendererParams & { rendererImage: string };
    rendererImage!: string;
    value!: any[];

    agInit(params: ICellRendererParams & { rendererImage: string }): void {
        this.params = params;
        this.updateImage();
    }

    updateImage() {
        this.rendererImage = `https://www.ag-grid.com/example-assets/weather/${this.params.rendererImage}`;
        this.value = new Array(this.params.value).fill(0);
    }

    refresh(params: ICellRendererParams & { rendererImage: string }) {
        this.params = params;
        this.updateImage();
        return true;
    }
}
