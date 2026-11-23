import type { ColDef, GridApi, GridOptions, Part, Theme } from 'ag-grid-community';
import {
    ModuleRegistry,
    colorSchemeDark,
    colorSchemeDarkBlue,
    colorSchemeDarkWarm,
    colorSchemeLight,
    colorSchemeLightCold,
    colorSchemeLightWarm,
    createGrid,
    enableDevValidations,
    themeAlpine,
    themeBalham,
    themeMaterial,
    themeQuartz,
} from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

const themes: Record<string, Theme> = {
    quartz: themeQuartz,
    alpine: themeAlpine,
    balham: themeBalham,
    material: themeMaterial,
};

const colorSchemes: Record<string, Part> = {
    light: colorSchemeLight,
    'light-warm': colorSchemeLightWarm,
    'light-cold': colorSchemeLightCold,
    dark: colorSchemeDark,
    'dark-warm': colorSchemeDarkWarm,
    'dark-blue': colorSchemeDarkBlue,
};

// ATHLETE is editable; COUNTRY, YEAR, AGE and SPORT are read-only.
const columnDefs: ColDef[] = [
    { field: 'athlete', filter: 'agTextColumnFilter' },
    { field: 'country', filter: 'agSetColumnFilter' },
    { field: 'year', filter: 'agSetColumnFilter' },
    { field: 'age', filter: 'agNumberColumnFilter' },
    { field: 'sport', filter: 'agTextColumnFilter', filterParams: { readOnly: true } },
];

let gridApi: GridApi<IOlympicData>;

const params = new URLSearchParams(window.location.search);

function getTheme(themeName: string | null, schemeName: string | null): Theme {
    const theme = themes[themeName ?? 'quartz'] ?? themeQuartz;
    const scheme = schemeName ? colorSchemes[schemeName] : undefined;
    return scheme ? theme.withPart(scheme) : theme;
}

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    theme: getTheme(params.get('theme'), params.get('scheme')),
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

function useTheme(themeName: string, mode: string) {
    document.documentElement.dataset.agThemeMode = mode;
    gridApi.setGridOption('theme', getTheme(themeName, null));
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const mode = params.get('mode');
    if (mode) {
        document.documentElement.dataset.agThemeMode = mode;
    }

    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
