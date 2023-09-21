import { ILoadingOverlayAngularComp } from "@ag-grid-community/angular"
import { ILoadingOverlayParams } from "@ag-grid-community/core"
import { Component } from "@angular/core"

@Component({
  selector: "app-loading-overlay",
  template: `
    <div class="ag-overlay-loading-center">
      <object
        style="height:100px; width:100px"
        type="image/svg+xml"
        data="https://ag-grid.com/images/ag-grid-loading-spinner.svg"
        aria-label="loading"
      ></object>
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
