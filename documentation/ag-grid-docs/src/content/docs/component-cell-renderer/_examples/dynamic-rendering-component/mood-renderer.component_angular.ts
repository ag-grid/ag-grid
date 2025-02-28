import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<img width="20px" [src]="imgForMood()" />`,
})
export class MoodRenderer implements ICellRendererAngularComp {
    imgForMood = signal('');

    agInit(params: ICellRendererParams): void {
        this.setMood(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.setMood(params);
        return true;
    }

    private setMood(params: ICellRendererParams) {
        this.imgForMood.set(
            'https://www.ag-grid.com/example-assets/smileys/' + (params.value === 'Happy' ? 'happy.png' : 'sad.png')
        );
    }
}
