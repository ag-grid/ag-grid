import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from "@ag-grid-community/core";
import { NgFor } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [NgFor],
  template: `
      <span :class="imgSpan" >
          <img *ngFor="let number of arr" [src]="src" :class="priceIcon" />
      </span>
  `,
})
export class PriceRenderer implements ICellRendererAngularComp {
  priceMultiplier: number = 1;
  src: string = "https://www.ag-grid.com/example-assets/pound.png";
  arr!: any[];

  agInit(params: ICellRendererParams): void {
    if (params.value > 5000000) {
      this.priceMultiplier = 2
    }
    if (params.value > 10000000) {
      this.priceMultiplier = 3
    }
    if (params.value > 25000000) {
      this.priceMultiplier = 4
    }
    if (params.value > 20000000) {
      this.priceMultiplier = 5
    }
    this.arr = new Array(this.priceMultiplier);
  }

  // Return Cell Value
  refresh(params: ICellRendererParams): boolean {
    if (params.value > 5000000) {
      this.priceMultiplier = 2
    }
    if (params.value > 10000000) {
      this.priceMultiplier = 3
    }
    if (params.value > 25000000) {
      this.priceMultiplier = 4
    }
    if (params.value > 20000000) {
      this.priceMultiplier = 5
    }
    this.arr = new Array(this.priceMultiplier).fill('');
    return true;
  }
}