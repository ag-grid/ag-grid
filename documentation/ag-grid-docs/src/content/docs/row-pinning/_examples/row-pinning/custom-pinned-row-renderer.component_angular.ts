import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

interface CustomParams extends ICellRendererParams {
    style: { [key: string]: string };
}

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle],
    template: `<span [ngStyle]="params()?.style">{{ params()?.value }}</span>`,
})
export class CustomPinnedRowRenderer implements ICellRendererAngularComp {
    params = signal<CustomParams | undefined>(undefined);

    agInit(params: CustomParams): void {
        this.params.set(params);
    }

    refresh(): boolean {
        return false;
    }
}
