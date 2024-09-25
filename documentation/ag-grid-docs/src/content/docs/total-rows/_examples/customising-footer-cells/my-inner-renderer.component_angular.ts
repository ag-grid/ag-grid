import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `<span style="text-decoration: {{ underline }}; font-weight: {{ fontWeight }};"
        >{{ prefix }} {{ cellValue }}</span
    >`,
})
export class MyInnerRenderer implements ICellRendererAngularComp {
    public cellValue = '';
    public underline = 'none';
    public fontWeight = '';
    public prefix = '';

    // gets called once before the renderer is used
    agInit(params: ICellRendererParams): void {
        this.cellValue = params.value;
        this.underline = params.node.footer ? 'underline' : 'none';
        this.fontWeight = params.node.footer && params.node.level === -1 ? 'bold' : '';
        if (params.node.footer) {
            this.prefix = params.node.level === -1 ? 'Grand Total' : 'Sub Total';
        }
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
