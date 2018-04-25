import { Component } from '@angular/core';
import { INoRowsOverlayAngularComp } from "ag-grid-angular";

@Component({
    selector: 'app-gender-renderer',
    template: `
            <span>
                <img [src]="imageSource" >{{value}}    
            </span>
    `
})
export class GenderCellRenderer implements INoRowsOverlayAngularComp {
    private imageSource: string;
    private value: any;

    agInit(params): void {
        const image = params.value === 'Male' ? 'male.png' : 'female.png';;
        this.imageSource = `../images/${image}`
        this.value = params.value;
    }
}