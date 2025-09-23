import type { ElementRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, HostBinding, ViewChild, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div class="athlete-info">
            <span>{{ data()?.athlete }}</span>
            <span>{{ data()?.country }}</span>
        </div>
        <span>{{ data()?.year }}</span>
        <i class="fas fa-arrows-alt-v" #myref></i>`,
})
export class CustomCellRenderer implements ICellRendererAngularComp {
    data = signal(undefined);
    private cellRendererParams!: ICellRendererParams;

    @ViewChild('myref') myRef!: ElementRef;
    @HostBinding('class') class = 'my-custom-cell-renderer';

    agInit(params: ICellRendererParams): void {
        this.cellRendererParams = params;
        this.data.set(params.data);
    }

    ngAfterViewInit() {
        this.cellRendererParams.registerRowDragger(this.myRef.nativeElement, 0);
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
