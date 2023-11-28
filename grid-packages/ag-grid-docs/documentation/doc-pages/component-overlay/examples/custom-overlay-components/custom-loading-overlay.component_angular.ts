import { ILoadingOverlayAngularComp } from "@ag-grid-community/angular"
import { ILoadingOverlayParams } from "@ag-grid-community/core"
import { Component } from "@angular/core"

@Component({
  selector: "app-loading-overlay",
  template: `
    <div class="ag-overlay-loading-center">
      <div style="width: 100px; height: 100px; background: url(https://ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat; margin: 0 auto;" aria-label="loading"></div>
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
