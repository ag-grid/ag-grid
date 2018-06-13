import {Component} from "@angular/core";

import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'cube-cell',
    template: `{{valueCubed()}}`
})
export class CubeRenderer implements ICellRendererAngularComp {
    private params: any;
    private cubed: number;

    // called on init
    agInit(params: any): void {
        this.params = params;
        this.cubed = this.params.data.value * this.params.data.value * this.params.data.value;
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        this.params = params;
        this.cubed = this.params.data.value * this.params.data.value * this.params.data.value;
        return true;
    }

    public valueCubed(): number {
        return this.cubed;
    }
}
