import { Component } from '@angular/core';
import { ICellRendererAngularComp, INoRowsOverlayAngularComp } from "@ag-grid-community/angular";
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
    selector: 'app-gender-renderer',
    template: `
            <span>
                <img [src]="imageSource" >{{value}}
            </span>
    `
})
export class GenderCellRenderer implements ICellRendererAngularComp {
    public imageSource!: string;
    public value: any;

    agInit(params: ICellRendererParams): void {
        const image = params.value === 'Male' ? 'male.png' : 'female.png';
        this.imageSource = `https://www.ag-grid.com/example-assets/genders/${image}`;
        this.value = params.value;
    }
    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
