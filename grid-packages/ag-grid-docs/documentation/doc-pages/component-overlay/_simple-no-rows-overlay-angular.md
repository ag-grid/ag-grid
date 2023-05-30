<framework-specific-section frameworks="angular">
|Below is an example of no rows overlay class with custom `noRowsMessageFunc()` param:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|import {Component} from '@angular/core';
|import {INoRowsOverlayParams} from "ag-grid-community";
|import {INoRowsOverlayAngularComp} from "ag-grid-angular";
|
|@Component({
|    selector: 'app-no-rows-overlay',
|    template: `
|      &lt;div class="ag-overlay-loading-center" style="background-color: lightcoral;">
|        &lt;i class="far fa-frown"> {{ params.noRowsMessageFunc() }} &lt;/i>
|      &lt;/div>`
|})
|export class CustomNoRowsOverlay implements INoRowsOverlayAngularComp {
|    public params: INoRowsOverlayParams & { noRowsMessageFunc: () => string};
|
|    agInit(params: INoRowsOverlayParams & { noRowsMessageFunc: () => string}): void {
|        this.params = params;
|    }
|}
|
|const gridOptions: GridOptions = {
|  ...
|  noRowsOverlayComponent: CustomNoRowsOverlay,
|  noRowsOverlayComponentParams: {
|    noRowsMessageFunc: () => 'Sorry - no rows! at: ' + new Date(),
|  },
|}
</snippet>
</framework-specific-section>
