import { Grid, GridOptions } from "@ag-grid-community/core";

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: "athlete", width: 150 },
        { field: "age", width: 90 },
        { field: "country", width: 150 },
        { field: "year", width: 90 },
        { field: "date", width: 150 },
        { field: "sport", width: 150 },
        { field: "gold", width: 100 },
        { field: "silver", width: 100 },
        { field: "bronze", width: 100 },
        { field: "total", width: 100 },
    ],
};

function fillLarge() {
    setWidthAndHeight('100%');
}

function fillMedium() {
    setWidthAndHeight('60%');
}

function fillExact() {
    setWidthAndHeight('400px');
}

function setWidthAndHeight(size: string) {
    var eGridDiv = document.querySelector<HTMLElement>('#myGrid')! as any;
    eGridDiv.style.setProperty('width', size);
    eGridDiv.style.setProperty('height', size);
}

var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
new Grid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data));
