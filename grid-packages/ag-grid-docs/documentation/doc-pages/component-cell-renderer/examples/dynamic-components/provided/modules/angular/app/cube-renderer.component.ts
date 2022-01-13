import { Component } from "@angular/core";

import { ICellRendererParams } from "@ag-grid-community/core";
import { ICellRendererAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'cube-cell',
    template: `{{valueCubed()}}`
})
export class CubeRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    private cubed!: number;

    // called on init
    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.cubed = this.params.data.value * this.params.data.value * this.params.data.value;
    }

    // called when the cell is refreshed
    refresh(params: ICellRendererParams): boolean {
        this.params = params;
        this.cubed = this.params.data.value * this.params.data.value * this.params.data.value;
        return true;
    }

    public valueCubed(): number {
        return this.cubed;
    }
}
