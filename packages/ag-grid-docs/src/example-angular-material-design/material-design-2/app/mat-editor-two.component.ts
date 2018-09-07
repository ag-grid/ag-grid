import { AfterViewInit, Component } from "@angular/core";

import { GridOptions } from "ag-grid-community";
import { MatSliderComponent } from "./mat-slider.component";
import { MatButtonToggleHeaderComponent } from "./mat-button-toggle.component";
import { ColumnAlignmentService } from "./columnAlignmentService";
import { MatProgressSpinnerComponent } from "./mat-progress-spinner.component";

@Component({
    selector: "my-app",
    templateUrl: "./mat-editor-two.component.html"
})
export class MatEditorComponentTwo implements AfterViewInit {
    public gridOptions: GridOptions;
    public onOffColumnAlignment: string = "left";

    constructor(private columnAlignmentService: ColumnAlignmentService) {
        this.gridOptions = <GridOptions>{
            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
            onGridReady: () => {
                this.gridOptions.api.sizeColumnsToFit();
            },
            rowHeight: 48, // recommended row height for material design data grids,
            headerHeight: 48,
            frameworkComponents: {
                sliderEditor: MatSliderComponent,
                toggleHeaderRenderer: MatButtonToggleHeaderComponent,
                progressRenderer: MatProgressSpinnerComponent
            }
        };

        this.columnAlignmentService.alignmentChanged$.subscribe(alignment => {
            this.onOffColumnAlignment = alignment;
            let nodesToUpdate = [];
            this.gridOptions.api.forEachNode(node => {
                nodesToUpdate.push(node);
            });

            this.gridOptions.api.refreshCells({
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
        this.gridOptions.api.forEachNode(rowNode => {
            setTimeout(() => {
                rowNode.setDataValue("random_col", this.randomNumberUpTo(100));
                this.gridOptions.api.refreshCells({
                    rowNodes: [rowNode],
                    columns: ["random_col"]
                });
            }, this.randomNumberUpTo(60) * 1000);
        });
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Percentage (popup slider editor)",
                field: "percentage",
                cellEditor: "sliderEditor",
                cellEditorParams: {
                    thumbLabel: true
                },
                editable: true
            },
            {
                headerName: "On/Off (button toggle header)",
                field: "on_off",
                headerComponent: "toggleHeaderRenderer",
                cellStyle: params => {
                    return { "text-align": this.onOffColumnAlignment };
                }
            },
            {
                headerName: "Random (progress spinner)",
                field: "random_col",
                cellRenderer: "progressRenderer",
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