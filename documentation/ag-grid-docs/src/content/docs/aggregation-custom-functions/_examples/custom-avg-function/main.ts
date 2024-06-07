import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, IAggFuncParams, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    RowGroupingModule,
    SetFilterModule,
]);

const columnDefs: ColDef[] = [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },
    {
        headerName: 'age using avgAggFunction()',
        field: 'age',
        aggFunc: avgAggFunction,
        enableValue: true,
        minWidth: 250,
    },
    {
        headerName: 'age using simpleAvg()',
        field: 'age',
        aggFunc: simpleAvg,
        enableValue: true,
        minWidth: 250,
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    autoGroupColumnDef: {
        field: 'athlete',
        minWidth: 350,
    },
    suppressAggFuncInHeader: true,
};

function simpleAvg(params: IAggFuncParams) {
    const values = params.values;
    const sum = values.reduce((a: number, b: number) => a + b, 0);
    return sum / values.length;
}

// the average function is tricky as the multiple levels require weighted averages
// for the non-leaf node aggregations.
function avgAggFunction(params: IAggFuncParams) {
    // the average will be the sum / count
    let sum = 0;
    let count = 0;

    params.values.forEach((value) => {
        const groupNode = value !== null && value !== undefined && typeof value === 'object';
        if (groupNode) {
            // we are aggregating groups, so we take the
            // aggregated values to calculated a weighted average
            sum += value.sum;
            count += value.count;
        } else {
            // skip values that are not numbers (ie skip empty values)
            if (typeof value === 'number') {
                sum += value;
                count++;
            }
        }
    });

    // avoid divide by zero error
    let avg = null;
    if (count !== 0) {
        avg = sum / count;
    }

    // the result will be an object. when this cell is rendered, only the avg is shown.
    // however when this cell is part of another aggregation, the count is also needed
    // to create a weighted average for the next level.
    const result = {
        sum: sum,
        count: count,
        value: avg,
    };

    return result;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
