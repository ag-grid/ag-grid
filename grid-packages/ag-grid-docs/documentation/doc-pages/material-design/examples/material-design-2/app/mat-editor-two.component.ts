import { AfterViewInit, Component } from "@angular/core";


import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-material.css";

import { MatSliderComponent } from "./mat-slider.component";
import { MatButtonToggleHeaderComponent } from "./mat-button-toggle.component";
import { ColumnAlignmentService } from "./columnAlignmentService";
import { MatProgressSpinnerComponent } from "./mat-progress-spinner.component";
import { ColDef, GridOptions } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";

@Component({
    selector: "my-app",
    template: `
    <div style="width: 100%;">
        <h2>Cell Editor with Material Design Components - Set 2</h2>
        <ag-grid-angular style="width: 100%; height: 250px;" class="ag-theme-material"
                     [gridOptions]="gridOptions"
                     [modules]="modules">
        </ag-grid-angular>
    </div>
    `
})
export class MatEditorComponentTwo implements AfterViewInit {
    public gridOptions: GridOptions;
    public onOffColumnAlignment = "left";

    modules = [ClientSideRowModelModule];

    constructor(private columnAlignmentService: ColumnAlignmentService) {
        this.gridOptions = {
            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
            onGridReady: () => {
                this.gridOptions.api!.sizeColumnsToFit();
            },
            rowHeight: 48, // recommended row height for material design data grids,
            headerHeight: 48
        };

        this.columnAlignmentService.alignmentChanged$.subscribe(alignment => {
            this.onOffColumnAlignment = alignment;
            const nodesToUpdate: any[] = [];
            this.gridOptions.api!.forEachNode(node => {
                nodesToUpdate.push(node);
            });

            this.gridOptions.api!.refreshCells({
                rowNodes: nodesToUpdate,
                columns: ["on_off"],
                force: true
            });
        });
    }

    randomNumberUpTo(upper: number) {
        return Math.floor(Math.random() * upper);
    }

    ngAfterViewInit() {
        this.gridOptions.api!.forEachNode(rowNode => {
            window.setTimeout(() => {
                rowNode.setDataValue("random_col", this.randomNumberUpTo(100));
                this.gridOptions.api!.refreshCells({
                    rowNodes: [rowNode],
                    columns: ["random_col"]
                });
            }, this.randomNumberUpTo(30) * 1000);
        });
    }

    private createColumnDefs(): ColDef[] {
        return [
            {
                headerName: "Percentage (popup slider editor)",
                field: "percentage",
                cellEditor: MatSliderComponent,
                cellEditorParams: {
                    thumbLabel: true
                },
                editable: true
            },
            {
                headerName: "On/Off (button toggle header)",
                field: "on_off",
                headerComponent: MatButtonToggleHeaderComponent,
                cellStyle: params => {
                    return { "text-align": this.onOffColumnAlignment };
                }
            },
            {
                headerName: "Random (progress spinner)",
                field: "random_col",
                cellRenderer: MatProgressSpinnerComponent,
                cellStyle: () => {
                    return { padding: "0px" };
                }
            }
        ];
    }

    private createRowData() {
        return [
            {
                full_name: "Sean Landsman",
                fruit: "Apple",
                on_off: "On",
                vegetable: "Carrot",
                percentage: 5
            },
            {
                full_name: "Niall Crosby",
                fruit: "Apple",
                on_off: "On",
                vegetable: "Potato",
                percentage: 35
            },
            {
                full_name: "Alberto Guiterzzz",
                fruit: "Orange",
                on_off: "Off",
                vegetable: "Broccoli",
                percentage: 78
            },
            {
                full_name: "John Masterson",
                fruit: "Banana",
                on_off: "On",
                vegetable: "Potato",
                percentage: 98
            }
        ];
    }
}
