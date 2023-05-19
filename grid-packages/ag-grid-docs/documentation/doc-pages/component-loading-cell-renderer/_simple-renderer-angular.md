<framework-specific-section frameworks="angular">
|Below is an example of loading cell renderer component that is passed a custom loadingMessage:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|import {Component} from '@angular/core';
|import {ILoadingCellRendererAngularComp} from "ag-grid-angular";
|import {ILoadingCellRendererParams} from "ag-grid-community";
|
|@Component({
|    selector: 'app-loading-cell-renderer',
|    template: `
|      &lt;div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">
|        &lt;i class="fas fa-spinner fa-pulse">&lt;/i>
|        &lt;span> {{ params.loadingMessage }} &lt;/span>
|      &lt;/div>
|    `
|})
|export class CustomLoadingCellRenderer implements ILoadingCellRendererAngularComp {
|    public params: ILoadingCellRendererParams & { loadingMessage: string };
|
|    agInit(params: ILoadingCellRendererParams & { loadingMessage: string }): void {
|        this.params = params;
|    }
|}
</snippet>
</framework-specific-section>