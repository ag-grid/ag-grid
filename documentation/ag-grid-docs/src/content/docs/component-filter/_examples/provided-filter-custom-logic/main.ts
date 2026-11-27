import type { DoesFilterPassParams, GridApi, GridOptions, SetFilterModel } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, SetFilterModule]);

function getAgeBand(age: number): string {
    if (age < 20) {
        return 'Under 20';
    }
    return age < 30 ? '20 to 29' : '30 and over';
}

function doesAgeBandPass({ model, node, handlerParams }: DoesFilterPassParams<IOlympicData, unknown, SetFilterModel>) {
    return model.values.includes(getAgeBand(handlerParams.getValue(node)));
}

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 180 },
        {
            field: 'age',
            filter: { component: 'agSetColumnFilter', doesFilterPass: doesAgeBandPass },
            filterParams: { values: ['Under 20', '20 to 29', '30 and over'] },
            floatingFilter: true,
        },
        { field: 'country' },
        { field: 'year' },
        { field: 'sport' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    enableFilterHandlers: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
