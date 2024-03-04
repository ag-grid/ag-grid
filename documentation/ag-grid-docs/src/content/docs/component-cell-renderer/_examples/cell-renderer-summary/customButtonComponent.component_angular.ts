import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from "@ag-grid-community/core";
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<button (click)="buttonClicked()">Launch!</button>`,
})
export class CustomButtonComponent implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams): void {}
  refresh(params: ICellRendererParams) {
    return true;
  }
  buttonClicked() {
    alert("Mission Launched");
  }
}