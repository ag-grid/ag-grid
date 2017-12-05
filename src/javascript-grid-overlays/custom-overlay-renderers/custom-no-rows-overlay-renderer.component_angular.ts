import { Component } from '@angular/core';
import {IComponent} from "../../../../ag-grid/src/ts/interfaces/iComponent";

@Component({
    selector: 'app-no-rows-overlay',
    template: `<div class="ag-overlay-loading-center" style="background-color: lightcoral; height: 9%">` +
              `   <i class="fa fa-frown-o"> Sorry - no rows!</i>` +
              `</div>`
})
export class CustomNoRowsOverlayRenderer implements IComponent {
    agInit(params: any): void {}
}