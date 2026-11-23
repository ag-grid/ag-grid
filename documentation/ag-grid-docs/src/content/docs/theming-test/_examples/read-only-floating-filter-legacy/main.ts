import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

// ATHLETE is editable; COUNTRY, YEAR, AGE and SPORT are read-only.
const columnDefs: ColDef[] = [
    { field: 'athlete', filter: 'agTextColumnFilter' },
    { field: 'country', filter: 'agSetColumnFilter' },
    { field: 'year', filter: 'agSetColumnFilter' },
    { field: 'age', filter: 'agNumberColumnFilter' },
    { field: 'sport', filter: 'agTextColumnFilter', filterParams: { readOnly: true } },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    theme: 'legacy',
    defaultColDef: {
        flex: 1,
        minWidth: 160,
        floatingFilter: true,
    },
    initialState: {
        filter: {
            filterModel: {
                athlete: { filterType: 'text', type: 'contains', filter: 'a' },
                country: { filterType: 'set', values: ['Great Britain', 'Italy', 'United States'] },
                age: {
                    filterType: 'number',
                    operator: 'OR',
                    conditions: [
                        { filterType: 'number', type: 'equals', filter: 56 },
                        { filterType: 'number', type: 'greaterThan', filter: 50 },
                    ],
                },
                sport: { filterType: 'text', type: 'contains', filter: 'e' },
            },
        },
    },
};

function useTheme(theme: string, isDark: boolean) {
    document.getElementById('myGrid')!.className = `ag-theme-${theme}${isDark ? '-dark' : ''}`;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const isDark = params.has('dark')
        ? params.get('dark') === 'true'
        : (document.documentElement.dataset.agThemeMode ?? '').startsWith('dark');
    useTheme(params.get('theme') ?? 'quartz', isDark);

    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
