import {Component} from '@angular/core';

import {AgRendererComponent} from 'ag-grid-ng2/main';

@Component({
    selector: 'cube-cell',
    template: `{{valueCubed()}}`
})
export class CubeComponent implements AgRendererComponent {
    private params: any;
    private cubed: number;

    // called on init
    agInit(params: any): void {
        this.params = params;
        this.cubed = this.params.data.value * this.params.data.value * this.params.data.value;
    }

    // called when the cell is refreshed
    refresh(params: any): void {
        this.params = params;
        this.cubed = this.params.data.value * this.params.data.value * this.params.data.value;
    }

    public valueCubed(): number {
        return this.cubed;
    }
}
