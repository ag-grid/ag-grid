import {Component} from "@angular/core";

@Component({
    selector: 'day-component',
    template: `<span><img *ngFor="let number of value" [src]="rendererImage"/></span>`
})
export class DaysFrostRenderer {
    params: any;
    rendererImage: string;
    value: any[];

    agInit(params: any): void {
        this.params = params;
        this.updateImage();
    }

    updateImage() {
        this.rendererImage = `https://www.ag-grid.com/example-assets/weather/${this.params.rendererImage}`;
        this.value = new Array(this.params.value).fill(0);
    }

    refresh(params: any) {
        this.params = params;
        this.updateImage();
    }
}
