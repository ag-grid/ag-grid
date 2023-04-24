import { Component } from "@angular/core";
import { IHeaderParams } from "@ag-grid-community/core";
import { IHeaderAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'custom-header',
    template: `
        <div class="custom-header">
            <span>{{params.displayName}}</span>
            <button>Click me</button>
            <input value="120"/>
            <a href="https://ag-grid.com" target="_blank">Link</a>
        </div>
    `
})
export class CustomHeader implements IHeaderAngularComp {
    public params!: IHeaderParams;

    agInit(params: IHeaderParams): void {
        this.params = params;
    }

    refresh(params: IHeaderParams) {
        return false;
    }
}
