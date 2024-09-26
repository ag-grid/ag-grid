import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

interface MissionCellRendererParams extends ICellRendererParams {
    src?: (params: boolean) => string;
}

@Component({
    selector: 'app-mission-result-renderer',
    standalone: true,
    template: `
        <span :class="missionSpan">
            @if (value) {
                <img [alt]="value" [src]="value" [height]="30" :class="missionIcon" />
            }
        </span>
    `,
    styles: [
        'img { width: auto; height: auto; } span {display: flex; height: 100%; justify-content: center; align-items: center} ',
    ],
})
export class MissionResultRenderer implements ICellRendererAngularComp {
    // Init Cell Value
    public value!: string;
    agInit(params: MissionCellRendererParams): void {
        if (params.src) {
            this.value = params.src(params.value);
        } else {
            this.value = `https://www.ag-grid.com/example-assets/icons/${
                params.value ? 'tick-in-circle' : 'cross-in-circle'
            }.png`;
        }
    }

    // Return Cell Value
    refresh(params: MissionCellRendererParams): boolean {
        if (params.src) {
            this.value = params.src(params.value);
        } else {
            this.value = `https://www.ag-grid.com/example-assets/icons/${
                params.value ? 'tick-in-circle' : 'cross-in-circle'
            }.png`;
        }
        return true;
    }
}
