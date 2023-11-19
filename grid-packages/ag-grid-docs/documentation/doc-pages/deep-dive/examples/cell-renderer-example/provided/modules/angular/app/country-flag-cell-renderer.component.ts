import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-country-flag-cell-renderer',
  standalone: true,
  imports: [CommonModule],
  template:
  `<span *ngIf="value"><img [alt]="' ' + value + ' Flag'" [src]="'https://www.ag-grid.com/example-assets/flags/' + value.toLowerCase() + '-flag-sm.png'" [height]="30" /></span>`
})

export class CountryFlagCellRendererComponent implements ICellRendererAngularComp {
  public value!: string;
  agInit(params: ICellRendererParams): void {
    this.value = params.value;
  }
  refresh(params: ICellRendererParams<any, any, any>): boolean {
    this.value = params.value;
    return true;
  }
}
