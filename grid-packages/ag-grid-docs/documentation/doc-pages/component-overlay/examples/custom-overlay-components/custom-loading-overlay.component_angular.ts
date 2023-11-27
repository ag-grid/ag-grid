import { ILoadingOverlayAngularComp } from "@ag-grid-community/angular"
import { ILoadingOverlayParams } from "@ag-grid-community/core"
import { Component } from "@angular/core"

@Component({
  selector: "app-loading-overlay",
  template: `
    <div class="ag-overlay-loading-center">
      <div style="position:absolute;top:0;left:0;right:0; bottom:0; background: url(https://ag-grid.com/images/ag-grid-loading-spinner.svg) center no-repeat" aria-label="loading"></div>
      <div>{{ params.loadingMessage }}</div>
    </div>
  `,
})
export class CustomLoadingOverlay implements ILoadingOverlayAngularComp {
  public params!: ILoadingOverlayParams & { loadingMessage: string }

  agInit(params: ILoadingOverlayParams & { loadingMessage: string }): void {
    this.params = params
  }
}
