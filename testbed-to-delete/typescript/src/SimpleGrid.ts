import {createGrid, GridOptions, ModuleRegistry} from "@ag-grid-community/core";
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";
import {StatusBarModule} from "@ag-grid-enterprise/status-bar";
import {ClipboardModule} from '@ag-grid-enterprise/clipboard';
import {ExcelExportModule} from '@ag-grid-enterprise/excel-export';
import {MenuModule} from '@ag-grid-enterprise/menu';
import {RangeSelectionModule} from '@ag-grid-enterprise/range-selection';
import './styles.scss';

debugger
ModuleRegistry.registerModules([ClientSideRowModelModule, StatusBarModule, ExcelExportModule, MenuModule, RangeSelectionModule, ClipboardModule]);

class SimpleGrid {
    private gridOptions: GridOptions = <GridOptions>{};

    constructor() {
        this.gridOptions = {
            columnDefs: this.createColumnDefs(),
            rowData: this.createRowData(),
            enableRangeSelection: true
        };

        let eGridDiv: HTMLElement = <HTMLElement>document.querySelector('#myGrid');
        createGrid(eGridDiv, this.gridOptions);
    }

    // specify the columns
    private createColumnDefs() {
        return [
            {field: "make"},
            {field: "model"},
            {field: "price"}
        ];
    }

    // specify the data
    private createRowData() {
        return [
            {make: "Toyota", model: "Celica", price: 35000},
            {make: "Ford", model: "Mondeo", price: 32000},
            {make: "Porsche", model: "Boxster", price: 72000}
        ];
    }
}

new SimpleGrid();
