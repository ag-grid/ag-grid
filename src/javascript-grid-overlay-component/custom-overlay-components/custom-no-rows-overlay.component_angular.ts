import { Component } from '@angular/core';
import { INoRowsOverlayAngularComp } from "ag-grid-angular";

@Component({
    selector: 'app-no-rows-overlay',
    template: `<div class="ag-overlay-loading-center" style="background-color: lightcoral; height: 9%">` +
              `   <i class="fa fa-frown-o"> Sorry - no rows!</i>` +
              `</div>`
})
export class CustomNoRowsOverlay implements INoRowsOverlayAngularComp {
    agInit(): void {}
}