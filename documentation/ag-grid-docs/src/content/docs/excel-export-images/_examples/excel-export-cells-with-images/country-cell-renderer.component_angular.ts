import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { FlagContext, IOlympicData } from './interfaces';

@Component({
    standalone: true,
    template: `<img
        alt="{{ params.data.country }}"
        src="{{ params.context.base64flags[params.context.countryCodes[params.data.country]] }}"
    />`,
})
export class CountryCellRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams<IOlympicData, any, FlagContext>;

    agInit(params: ICellRendererParams<IOlympicData, any, FlagContext>): void {
        this.params = params;
    }

    refresh() {
        return false;
    }
}
