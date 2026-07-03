import type { ColDef, ExcelRow, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ExcelExportModule]);

type OlympicWinner = {
    athlete: string;
    country: string;
    year: number;
    sport: string;
    gold: number;
};

const columnDefs: ColDef<OlympicWinner>[] = [
    { field: 'athlete', minWidth: 180 },
    { field: 'country', minWidth: 180 },
    { field: 'year', maxWidth: 120 },
    { field: 'sport', minWidth: 160 },
    { field: 'gold', maxWidth: 120 },
];

const rowData: OlympicWinner[] = [
    { athlete: 'Michael Phelps', country: 'United States', year: 2008, sport: 'Swimming', gold: 8 },
    { athlete: 'Usain Bolt', country: 'Jamaica', year: 2008, sport: 'Athletics', gold: 3 },
    { athlete: 'Simone Biles', country: 'United States', year: 2016, sport: 'Gymnastics', gold: 4 },
    { athlete: 'Katie Ledecky', country: 'United States', year: 2016, sport: 'Swimming', gold: 4 },
];

let gridApi: GridApi<OlympicWinner>;

const extraContent: ExcelRow[] = [
    {
        cells: [
            {
                data: { type: 'String', value: 'Export Summary' },
                styleId: 'coverHeading',
                note: {
                    text: 'This note is added only during export through ExcelCell.note.',
                },
            },
        ],
    },
    { cells: [] },
];

const gridOptions: GridOptions<OlympicWinner> = {
    columnDefs,
    rowData,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    excelStyles: [
        {
            id: 'coverHeading',
            font: {
                bold: true,
                size: 14,
            },
        },
    ],
    defaultExcelExportParams: {
        author: 'Portfolio Ops',
        prependContent: extraContent,
    },
};

function onBtExport() {
    gridApi.exportDataAsExcel();
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
