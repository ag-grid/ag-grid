import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

interface MissionCellRendererParams extends ICellRendererParams {
    src?: (params: boolean) => string;
}

@Component({
    selector: 'app-mission-result-renderer',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span class="missionSpan">
            @if (value()) {
                <img [alt]="value()" [src]="value()" class="missionIcon" />
            }
        </span>
    `,
})
export class MissionResultRenderer implements ICellRendererAngularComp {
    value = signal<string>('');
    agInit(params: MissionCellRendererParams): void {
        this.refresh(params);
    }

    refresh(params: MissionCellRendererParams): boolean {
        if (params.src) {
            this.value.set(params.src(params.value));
        } else {
            const defaultSrc = `https://www.ag-grid.com/example-assets/icons/${
                params.value ? 'tick-in-circle' : 'cross-in-circle'
            }.png`;
            this.value.set(defaultSrc);
        }
        return true;
    }
}
