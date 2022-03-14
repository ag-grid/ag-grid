import { Component } from '@angular/core';
import { INoRowsOverlayParams } from "@ag-grid-community/core";
import { INoRowsOverlayAngularComp } from "@ag-grid-community/angular";

@Component({
  selector: 'app-no-rows-overlay',
  template: `
      <div class="ag-overlay-loading-center" style="background-color: lightcoral;">
        <i class="far fa-frown"> {{ this.params.noRowsMessageFunc() }} </i>
      </div>`
})
export class CustomNoRowsOverlay implements INoRowsOverlayAngularComp {
  public params!: INoRowsOverlayParams & { noRowsMessageFunc: () => string };

  agInit(params: INoRowsOverlayParams & { noRowsMessageFunc: () => string }): void {
    this.params = params;
  }
}
