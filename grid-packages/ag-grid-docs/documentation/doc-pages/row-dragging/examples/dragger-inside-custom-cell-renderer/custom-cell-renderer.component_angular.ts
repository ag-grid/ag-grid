import { Component, HostBinding, ViewChild } from "@angular/core";

import { ICellRendererParams } from "@ag-grid-community/all-modules";

@Component({
    selector: 'custom-cell',
    template: /* html */
        `<div class="athlete-info">
            <span>{{athlete}}</span>
            <span>{{country}}</span>
        </div>
        <span>{{year}}</span>
        <i class="fas fa-arrows-alt-v" #myref></i>`,
})
export class CustomCellRenderer {
    private athlete: string;
    private country: string;
    private year: string;
    private cellRendererParams: ICellRendererParams;

    @ViewChild('myref') myRef;
    @HostBinding('class') class = 'my-custom-cell-renderer';

    agInit(params: ICellRendererParams): void {
        this.cellRendererParams = params;
        this.athlete = params.data.athlete;
        this.country = params.data.country;
        this.year = params.data.year;
    }

    ngAfterViewInit() {
        this.cellRendererParams.registerRowDragger(this.myRef.nativeElement);
    }
}
