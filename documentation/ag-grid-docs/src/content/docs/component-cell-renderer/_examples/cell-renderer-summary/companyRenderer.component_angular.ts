import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from "@ag-grid-community/core";
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <a [href]="'https://en.wikipedia.org/wiki/' + value" target="_blank">{{ value }}</a>
  `
})
export class CompanyRenderer implements ICellRendererAngularComp {
  // Init Cell Value
  public value!: string;
  public parsedValue!: string;
  agInit(params: ICellRendererParams): void {
    this.value = params.value;
  }

  // Return Cell Value
  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    return true;
  }
}