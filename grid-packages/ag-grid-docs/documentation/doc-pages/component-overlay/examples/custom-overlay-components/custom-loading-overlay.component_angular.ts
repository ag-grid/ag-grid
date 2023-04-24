import { Component } from '@angular/core';
import { ILoadingOverlayParams } from "@ag-grid-community/core";
import { ILoadingOverlayAngularComp } from "@ag-grid-community/angular";

@Component({
  selector: 'app-loading-overlay',
  template: `
      <div class="ag-overlay-loading-center" style="background-color: lightsteelblue;">
        <i class="fas fa-hourglass-half">{{ params.loadingMessage }} </i>
      </div>
    `
})
export class CustomLoadingOverlay implements ILoadingOverlayAngularComp {
  public params!: ILoadingOverlayParams & { loadingMessage: string };

  agInit(params: ILoadingOverlayParams & { loadingMessage: string }): void {
    this.params = params;
  }
}
