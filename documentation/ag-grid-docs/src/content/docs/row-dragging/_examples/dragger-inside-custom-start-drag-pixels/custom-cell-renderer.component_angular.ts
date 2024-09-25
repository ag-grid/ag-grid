import { Component, ElementRef, HostBinding, ViewChild } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    /* html */
    template: `<div class="athlete-info">
            <span>{{ athlete }}</span>
            <span>{{ country }}</span>
        </div>
        <span>{{ year }}</span>
        <i class="fas fa-arrows-alt-v" #myref></i>`,
})
export class CustomCellRenderer implements ICellRendererAngularComp {
    public athlete!: string;
    public country!: string;
    public year!: string;
    private cellRendererParams!: ICellRendererParams;

    @ViewChild('myref') myRef!: ElementRef;
    @HostBinding('class') class = 'my-custom-cell-renderer';

    agInit(params: ICellRendererParams): void {
        this.cellRendererParams = params;
        this.athlete = params.data.athlete;
        this.country = params.data.country;
        this.year = params.data.year;
    }

    ngAfterViewInit() {
        this.cellRendererParams.registerRowDragger(this.myRef.nativeElement, 0);
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
