import type { ColDef, GridApi, GridOptions, ITextFilterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function contains(target: string, lookingFor: string) {
    return target && target.indexOf(lookingFor) >= 0;
}

const countryFilterParams: ITextFilterParams = {
    textMatcher: ({ filterOption, value, filterText }) => {
        if (filterText == null) {
            return false;
        }
        switch (filterOption) {
            case 'contains':
                const aliases: Record<string, string> = {
                    usa: 'united states',
                    holland: 'netherlands',
                    niall: 'ireland',
                    sean: 'south africa',
                    alberto: 'mexico',
                    john: 'australia',
                    xi: 'china',
                };

                const literalMatch = contains(value, filterText || '');

                return !!literalMatch || !!contains(value, aliases[filterText || '']);
            case 'notContains':
                return value.indexOf(filterText) < 0;
            case 'equals':
                return value === filterText;
            case 'notEqual':
                return value != filterText;
            case 'startsWith':
                return value.indexOf(filterText) === 0;
            case 'endsWith':
                const index = value.lastIndexOf(filterText);
                return index >= 0 && index === value.length - filterText.length;
            default:
                // should never happen
                console.warn('invalid filter type ' + filterOption);
                return false;
        }
    },
};

const columnDefs: ColDef[] = [
    {
        field: 'country',
        filterParams: countryFilterParams,
    },
    {
        field: 'athlete',
    },
    {
        field: 'sport',
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
        filter: true,
    },
    columnDefs: columnDefs,
    rowData: null,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
