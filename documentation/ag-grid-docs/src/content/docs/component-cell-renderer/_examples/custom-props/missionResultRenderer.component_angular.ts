import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from "@ag-grid-community/core";
import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

interface MissionCellRendererParams extends ICellRendererParams {
  src?: (params: boolean) => string;
}

@Component({
selector: 'app-mission-result-renderer',
standalone: true,
imports: [NgIf],
template:`
<span *ngIf="value" :class="missionSpan" >
  <img
    [alt]="value"
    [src]="value"
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
agInit(params: MissionCellRendererParams): void {
  if (params.src) {
    this.value = params.src(params.value)
  } else {
    this.value = `https://www.ag-grid.com/example-assets/icons/${
      params.value ? "tick-in-circle" : "cross-in-circle"
    }.png`;
  }
}

// Return Cell Value
refresh(params: MissionCellRendererParams): boolean {
  if (params.src) {
    this.value = params.src(params.value)
  } else {
    this.value = `https://www.ag-grid.com/example-assets/icons/${
      params.value ? "tick-in-circle" : "cross-in-circle"
    }.png`;
  }
  return true;
}
}