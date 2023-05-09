<framework-specific-section frameworks="angular">
|Below is a example of loading overlay class with a custom `loadingMessage` param:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|import {Component} from '@angular/core';
|import {ILoadingOverlayParams} from "ag-grid-community";
|import {ILoadingOverlayAngularComp} from "ag-grid-angular";
|
|@Component({
|    selector: 'app-loading-overlay',
|    template: `
|      &lt;div class="ag-overlay-loading-center" style="background-color: lightsteelblue;">
|        &lt;i class="fas fa-hourglass-half">{{ params.loadingMessage }} &lt;/i>
|      &lt;/div>
|    `
|})
|export class CustomLoadingOverlay implements ILoadingOverlayAngularComp {
|    public params: ILoadingOverlayParams & { loadingMessage: string};
|
|    agInit(params: ILoadingOverlayParams & { loadingMessage: string}): void {
|        this.params = params;
|    }
|}
|
|const gridOptions: GridOptions = {
|  ...
|  loadingOverlayComponent: CustomLoadingOverlay,
|  loadingOverlayComponentParams: {
|    loadingMessage: 'One moment please...',
|  },
|}
</snippet>
</framework-specific-section>