import { AG_GRID_LOCALE_EG, AG_GRID_LOCALE_IL } from '@ag-grid-community/locale';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    LocaleModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    NumberEditorModule,
    TextEditorModule,
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    LocaleModule,
]);

interface LanguageConfig {
    localeText: Record<string, string> | undefined;
    enableRtl: boolean;
    columnDefs: ColDef[];
    rowData: Record<string, any>[];
}

const LANGUAGES: Record<string, LanguageConfig> = {
    arabic: {
        localeText: AG_GRID_LOCALE_EG,
        enableRtl: true,
        columnDefs: [
            { field: 'name', headerName: 'الاسم' },
            { field: 'city', headerName: 'المدينة' },
            { field: 'country', headerName: 'البلد' },
            { field: 'population', headerName: 'عدد السكان' },
            { field: 'area', headerName: 'المساحة (كم²)' },
        ],
        rowData: [
            { name: 'القاهرة', city: 'القاهرة', country: 'مصر', population: 21_323_000, area: 3_085 },
            { name: 'الرياض', city: 'الرياض', country: 'السعودية', population: 7_677_000, area: 1_798 },
            { name: 'دبي', city: 'دبي', country: 'الإمارات', population: 3_564_000, area: 1_588 },
            { name: 'الدار البيضاء', city: 'الدار البيضاء', country: 'المغرب', population: 3_752_000, area: 384 },
            { name: 'بغداد', city: 'بغداد', country: 'العراق', population: 8_126_000, area: 673 },
            { name: 'الجزائر', city: 'الجزائر', country: 'الجزائر', population: 3_915_000, area: 363 },
            { name: 'عمّان', city: 'عمّان', country: 'الأردن', population: 4_008_000, area: 1_680 },
            { name: 'تونس', city: 'تونس', country: 'تونس', population: 2_365_000, area: 212 },
            { name: 'بيروت', city: 'بيروت', country: 'لبنان', population: 2_434_000, area: 67 },
            { name: 'الكويت', city: 'الكويت', country: 'الكويت', population: 2_989_000, area: 200 },
        ],
    },
    hebrew: {
        localeText: AG_GRID_LOCALE_IL,
        enableRtl: true,
        columnDefs: [
            { field: 'name', headerName: 'שם' },
            { field: 'city', headerName: 'עיר' },
            { field: 'country', headerName: 'מדינה' },
            { field: 'population', headerName: 'אוכלוסייה' },
            { field: 'area', headerName: 'שטח (קמ״ר)' },
        ],
        rowData: [
            { name: 'ירושלים', city: 'ירושלים', country: 'ישראל', population: 982_000, area: 126 },
            { name: 'תל אביב', city: 'תל אביב', country: 'ישראל', population: 467_000, area: 52 },
            { name: 'חיפה', city: 'חיפה', country: 'ישראל', population: 285_000, area: 64 },
            { name: 'ראשון לציון', city: 'ראשון לציון', country: 'ישראל', population: 254_000, area: 59 },
            { name: 'פתח תקווה', city: 'פתח תקווה', country: 'ישראל', population: 247_000, area: 36 },
            { name: 'אשדוד', city: 'אשדוד', country: 'ישראל', population: 226_000, area: 47 },
            { name: 'נתניה', city: 'נתניה', country: 'ישראל', population: 221_000, area: 29 },
            { name: 'באר שבע', city: 'באר שבע', country: 'ישראל', population: 210_000, area: 117 },
            { name: 'חולון', city: 'חולון', country: 'ישראל', population: 196_000, area: 19 },
            { name: 'בני ברק', city: 'בני ברק', country: 'ישראל', population: 204_000, area: 7 },
        ],
    },
    english: {
        localeText: undefined,
        enableRtl: false,
        columnDefs: [
            { field: 'name', headerName: 'Name' },
            { field: 'city', headerName: 'City' },
            { field: 'country', headerName: 'Country' },
            { field: 'population', headerName: 'Population' },
            { field: 'area', headerName: 'Area (km²)' },
        ],
        rowData: [
            { name: 'London', city: 'London', country: 'United Kingdom', population: 9_541_000, area: 1_572 },
            { name: 'New York', city: 'New York', country: 'United States', population: 8_336_000, area: 783 },
            { name: 'Sydney', city: 'Sydney', country: 'Australia', population: 5_312_000, area: 12_368 },
            { name: 'Toronto', city: 'Toronto', country: 'Canada', population: 2_794_000, area: 630 },
            { name: 'Dublin', city: 'Dublin', country: 'Ireland', population: 1_263_000, area: 115 },
            { name: 'Cape Town', city: 'Cape Town', country: 'South Africa', population: 4_618_000, area: 2_461 },
            { name: 'Singapore', city: 'Singapore', country: 'Singapore', population: 5_917_000, area: 733 },
            { name: 'Auckland', city: 'Auckland', country: 'New Zealand', population: 1_657_000, area: 1_086 },
            { name: 'Mumbai', city: 'Mumbai', country: 'India', population: 21_297_000, area: 603 },
            { name: 'Nairobi', city: 'Nairobi', country: 'Kenya', population: 4_922_000, area: 696 },
        ],
    },
};

let gridApi: GridApi;

function getGridOptions(language: string): GridOptions {
    const config = LANGUAGES[language];
    return {
        columnDefs: config.columnDefs,
        rowData: config.rowData,
        enableRtl: config.enableRtl,
        localeText: config.localeText,
        defaultColDef: {
            editable: true,
            flex: 1,
            minWidth: 100,
            filter: true,
        },
    };
}

function onLanguageChange() {
    const select = document.querySelector<HTMLSelectElement>('#language')!;
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    gridApi.destroy();
    gridApi = createGrid(gridDiv, getGridOptions(select.value));
}

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, getGridOptions('arabic'));
});
