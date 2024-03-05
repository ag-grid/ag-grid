import {createGrid, GridOptions} from "ag-grid-community";
import "ag-grid-enterprise";
import './styles.scss';

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
