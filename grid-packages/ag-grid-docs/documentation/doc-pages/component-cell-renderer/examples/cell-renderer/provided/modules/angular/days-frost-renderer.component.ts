import { Component } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";

import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { ICellRendererParams } from "@ag-grid-community/core";

export interface ImageCellRendererParams extends ICellRendererParams {
    rendererImage: string;
    showPrefix: boolean;
}

@Component({
    standalone: true,
    imports: [NgIf, NgFor],
    template: `<span><span *ngIf="showPrefix">Days: </span><img *ngFor="let number of value" [src]="rendererImage"/></span>`
})
export class DaysFrostRenderer implements ICellRendererAngularComp {
    params!: ImageCellRendererParams;
    rendererImage!: string;
    value!: any[];
    showPrefix: boolean = false;

    agInit(params: ImageCellRendererParams): void {
        this.params = params;
        this.updateImage();
    }

    updateImage() {
        this.showPrefix = this.params.showPrefix;
        this.rendererImage = `https://www.ag-grid.com/example-assets/weather/${this.params.rendererImage}`;
        this.value = new Array(this.params.value).fill(0);
    }

    refresh(params: ImageCellRendererParams) {
        this.params = params;
        this.updateImage();
        return true;
    }
}
