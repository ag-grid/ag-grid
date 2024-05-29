import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

import { type ICellRendererAngularComp } from 'ag-grid-angular';
import { type ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'ticker-cell-renderer',
    standalone: true,
    imports: [NgIf],
    template: `
        <div *ngIf="value">
            <img class="image" [src]="imgSrc" [alt]="ticker" />
            <span>{{ tickerNormal }}</span>
        </div>
    `,
    styles: `
        .image {
            width: 20px;
            height: 20px;
            margin-right: 5px;
            border-radius: 100px;
        }
    `,
})
export class TickerCellRenderer implements ICellRendererAngularComp {
    public value!: string;
    public ticker!: string;
    public tickerNormal!: string;
    public imgSrc!: string;

    agInit(params: ICellRendererParams): void {
        this.value = params.value;
        this.updateTickerValues();
    }

    updateTickerValues() {
        if (!this.value) {
            return;
        }

        this.ticker = this.value.toLowerCase();
        this.tickerNormal = this.value;
        this.imgSrc = `/example/finance/logos/${this.ticker}.png`;
    }

    // Return Cell Value
    refresh(params: ICellRendererParams): boolean {
        this.value = params.value;
        this.updateTickerValues();
        return true;
    }
}
