import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, GridApi, GridOptions, IAggFuncParams } from 'ag-grid-community';
import { ModuleRegistry, createGrid } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { FiltersToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

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
        comparator: (valueA: number | { value: number }, valueB: number | { value: number }) => {
            let v1 = valueA;
            let v2 = valueB;

            if (valueA && typeof valueA === 'object') {
                v1 = valueA.value;
            }

            if (valueB && typeof valueB === 'object') {
                v2 = valueB.value;
            }

            if (v1 == v2) return 0;

            return v1 > v2 ? 1 : -1;
        },
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
