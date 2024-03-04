import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from "@ag-grid-community/core";
import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-mission-result-renderer',
  standalone: true,
  imports: [NgIf],
  template:`
  <span *ngIf="value" :class="missionSpan" >
    <img
      [alt]="value"
      [src]="'https://www.ag-grid.com/example-assets/icons/' + value + '.png'"
      [height]="30"
      :class="missionIcon"
    />
  </span>
  `,
  styles: ["img { width: auto; height: auto; } span {display: flex; height: 100%; justify-content: center; align-items: center} "]
})
export class MissionResultRenderer implements ICellRendererAngularComp {
  // Init Cell Value
  public value!: string;
  agInit(params: ICellRendererParams): void {
    this.value = params.value ? 'tick-in-circle' : 'cross-in-circle';
  }

  // Return Cell Value
  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    return true;
  }
}