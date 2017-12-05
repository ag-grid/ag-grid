import { Component } from '@angular/core';
import { IComponent } from "../../../../ag-grid/src/ts/interfaces/iComponent";

@Component({
    selector: 'app-loading-overlay',
    template: `<div class="ag-overlay-loading-center" style="background-color: lightsteelblue; height: 9%">` +
              `   <i class="fa fa-hourglass-1"> One moment please...</i>` +
              `</div>`
})
export class CustomLoadingOverlayRenderer implements IComponent {
    agInit(params: any): void {}
}