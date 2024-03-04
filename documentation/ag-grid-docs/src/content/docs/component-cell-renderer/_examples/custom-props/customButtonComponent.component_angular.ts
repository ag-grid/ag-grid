import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from "@ag-grid-community/core";
import { Component } from '@angular/core';

interface CustomButtonParams extends ICellRendererParams {
  onClick: () => void;
}

@Component({
  standalone: true,
  template: `<button (click)="onClick()">Launch!</button>`,
})
export class CustomButtonComponent implements ICellRendererAngularComp {
  onClick!: () => void
  agInit(params: CustomButtonParams): void {
    this.onClick = params.onClick
  }
  refresh(params: CustomButtonParams) {
    return true;
  }
}