[[only-angular]]
|Below is a simple example of a loading overlay component:
|
|```js
|import {Component} from '@angular/core';
|import {ILoadingOverlayParams} from "@ag-grid-community/core";
|import {ILoadingOverlayAngularComp} from "@ag-grid-community/angular";
|
|@Component({
|    selector: 'app-loading-overlay',
|    template: `
|      <div class="ag-overlay-loading-center" style="background-color: lightsteelblue;">
|        <i class="fas fa-hourglass-half">{{ this.params.loadingMessage }} </i>
|      </div>
|    `
|})
|export class CustomLoadingOverlay implements ILoadingOverlayAngularComp {
|    private params: ILoadingOverlayParams;
|
|    agInit(params: ILoadingOverlayParams): void {
|        this.params = params;
|    }
|}
|```
