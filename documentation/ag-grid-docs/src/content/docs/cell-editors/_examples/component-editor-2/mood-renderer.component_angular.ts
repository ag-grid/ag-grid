import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `<div class="mood-renderer"><img width="20px" [src]="imgForMood" /></div>`,
})
export class MoodRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    private mood!: string;
    public imgForMood!: string;

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.setMood(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.params = params;
        this.setMood(params);
        return true;
    }

    private setMood(params: ICellRendererParams) {
        this.mood = params.value;
        this.imgForMood =
            'https://www.ag-grid.com/example-assets/smileys/' + (this.mood === 'Happy' ? 'happy.png' : 'sad.png');
    }
}
