[[only-angular]]
|Below is a simple example of loading cell renderer component:
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
|    private params: any;
|
|    agInit(params: ILoadingCellRendererParams): void {
|        this.params = params;
|    }
|}
|```
