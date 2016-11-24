import {Component,OnDestroy} from '@angular/core';

import {AgRendererComponent} from 'ag-grid-ng2/main';

@Component({
    selector: 'square-cell',
    template: `{{valueSquared()}}`
})
export class SquareComponent implements AgRendererComponent, OnDestroy {
    private params:any;

    agInit(params:any):void {
        this.params = params;
    }

    public valueSquared():number {
        return this.params.value * this.params.value;
    }

    ngOnDestroy() {
        console.log(`Destroying SquareComponent`);
    }
}