import { Component } from "@angular/core";
import { ICellRendererParams } from "@ag-grid-community/core";
import { ICellRendererAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'full-cell-renderer',
    template: `
        <div class="full-width-panel">
            <button><img width="15" height="10" src="https://www.ag-grid.com/example-assets/flags/{{params.data.code}}.png"></button>
            <input value="{{params.data.name}}"/>
            <a href="https://www.google.com/search?q={{params.data.language}}" target="_blank">{{params.data.language}}</a>
        </div>
    `
})
export class FullWidthCellRenderer implements ICellRendererAngularComp {
    params!: ICellRendererParams

    agInit(params: ICellRendererParams): void {
        this.params = params
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
