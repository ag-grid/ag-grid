[[only-angular]]
|Below is an example of loading cell renderer component that is passed a custom loadingMessage:
|
|```js
|import {Component} from '@angular/core';
|import {ILoadingCellRendererAngularComp} from "@ag-grid-community/angular";
|import {ILoadingCellRendererParams} from "@ag-grid-community/core";
|
|@Component({
|    selector: 'app-loading-cell-renderer',
|    template: `
|      <div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">
|        <i class="fas fa-spinner fa-pulse"></i>
|        <span> {{ this.params.loadingMessage }} </span>
|      </div>
|    `
|})
|export class CustomLoadingCellRenderer implements ILoadingCellRendererAngularComp {
|    public params: ILoadingCellRendererParams & { loadingMessage: string };
|
|    agInit(params: ILoadingCellRendererParams & { loadingMessage: string }): void {
|        this.params = params;
|    }
|}
|```
