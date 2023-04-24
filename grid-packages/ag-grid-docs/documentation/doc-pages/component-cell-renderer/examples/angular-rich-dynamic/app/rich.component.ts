import { Component } from "@angular/core";

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { RatioParentComponent } from "./ratio.parent.component";
import { ClickableParentComponent } from "./clickable.parent.component";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ColDef, GridOptions, GridReadyEvent, Module } from "@ag-grid-community/core";

@Component({
    selector: 'my-app',
    template: `
    <ag-grid-angular style="width: 100%; height: 360px;" class="ag-theme-alpine"
                 [gridOptions]="gridOptions"
                 (gridReady)="onGridReady($event)"
                 [modules]="modules">
    </ag-grid-angular>
    `
})
export class RichComponent {
    public gridOptions: GridOptions;
    public modules: Module[] = [ClientSideRowModelModule];

    constructor() {
        this.gridOptions = {
            rowData: RichComponent.createRowData(),
            columnDefs: RichComponent.createColumnDefs(),
            rowHeight: 50
        };
    }

    private static createColumnDefs(): ColDef[] {
        return [
            { headerName: "Name", field: "name", width: 200 },
            {
                headerName: "Ratio Component",
                field: "ratios",
                cellRenderer: RatioParentComponent,
                width: 350
            },
            {
                headerName: "Clickable Component",
                field: "name",
                cellRenderer: ClickableParentComponent,
                width: 330
            }
        ];
    }

    private static createRowData() {
        return [
            { name: 'Homer Simpson', ratios: { top: 0.25, bottom: 0.75 } },
            { name: 'Marge Simpson', ratios: { top: 0.67, bottom: 0.39 } },
            { name: 'Bart Simpson', ratios: { top: 0.82, bottom: 0.47 } },
            { name: 'Lisa Simpson', ratios: { top: 0.39, bottom: 1 } },
            { name: 'Barney', ratios: { top: 0.22, bottom: 0.78 } },
            { name: 'Sideshow Bob', ratios: { top: 0.13, bottom: 0.87 } },
            { name: 'Ned Flanders', ratios: { top: 0.49, bottom: 0.51 } },
            { name: 'Milhouse', ratios: { top: 0.69, bottom: 0.31 } },
            { name: 'Apu', ratios: { top: 0.89, bottom: 0.11 } },
            { name: 'Moe', ratios: { top: 0.64, bottom: 0.36 } },
            { name: 'Smithers', ratios: { top: 0.09, bottom: 0.91 } },
            { name: 'Edna Krabappel', ratios: { top: 0.39, bottom: 0.61 } },
            { name: 'Krusty', ratios: { top: 0.74, bottom: 0.26 } }
        ];
    }

    onGridReady(params: GridReadyEvent) {
        params.api.sizeColumnsToFit();
    }
}
