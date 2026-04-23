import type {
    ColDef,
    ExcelExportParams,
    ExcelRow,
    GetRowIdParams,
    GridApi,
    GridOptions,
    Note,
    NotesDataSource,
    NotesDataSourceGetNoteParams,
    NotesDataSourceSetNoteParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ContextMenuModule, ExcelExportModule, NotesModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ContextMenuModule,
    ExcelExportModule,
    NotesModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

type OlympicWinner = {
    id: string;
    athlete: string;
    country: string;
    year: number;
    sport: string;
    gold: number;
};

const getNoteKey = (rowId: string, colId: string) => `${rowId}::${colId}`;

const noteStore = new Map<string, Note>([
    [
        getNoteKey('1', 'athlete'),
        {
            text: 'Confirm the athlete biography before publishing the desk report.',
            author: 'Maya',
            updatedAt: '29 Mar 2026, 09:15',
        },
    ],
    [
        getNoteKey('3', 'country'),
        {
            text: 'Check the latest federation naming guidance for this country.',
            updatedAt: '27 Mar 2026, 14:30',
        },
    ],
]);

const notesDataSource: NotesDataSource = {
    getNote: (params: NotesDataSourceGetNoteParams) =>
        noteStore.get(getNoteKey(params.rowNode.id!, params.column.getColId())),
    setNote: (params: NotesDataSourceSetNoteParams) => {
        const key = getNoteKey(params.rowNode.id!, params.column.getColId());

        if (params.note === undefined) {
            noteStore.delete(key);
        } else {
            noteStore.set(key, params.note);
        }
    },
};

const columnDefs: ColDef<OlympicWinner>[] = [
    { field: 'athlete', minWidth: 180 },
    { field: 'country', minWidth: 180 },
    { field: 'year', maxWidth: 120 },
    { field: 'sport', minWidth: 160 },
    { field: 'gold', maxWidth: 120 },
];

const rowData: OlympicWinner[] = [
    { id: '1', athlete: 'Michael Phelps', country: 'United States', year: 2008, sport: 'Swimming', gold: 8 },
    { id: '2', athlete: 'Usain Bolt', country: 'Jamaica', year: 2008, sport: 'Athletics', gold: 3 },
    { id: '3', athlete: 'Simone Biles', country: 'United States', year: 2016, sport: 'Gymnastics', gold: 4 },
    { id: '4', athlete: 'Katie Ledecky', country: 'United States', year: 2016, sport: 'Swimming', gold: 4 },
];

let gridApi: GridApi<OlympicWinner>;

const getExtraContentRows = (): ExcelRow[] => [
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
    {
        cells: [
            {
                data: {
                    type: 'String',
                    value: 'Grid notes start from excelNoteValue and append metadata from gridNote. Extra content rows can also carry notes.',
                },
            },
        ],
    },
    { cells: [] },
];

const defaultExcelExportParams: ExcelExportParams = {
    allColumns: true,
    author: 'Portfolio Ops',
    prependContent: getExtraContentRows(),
    processNoteCallback: (params) => {
        if (params.excelNoteValue) {
            return {
                ...params.excelNoteValue,
                text: `${params.excelNoteValue.text}\n\nUpdated: ${params.gridNote?.updatedAt ?? 'Not recorded'}`,
            };
        }

        if (params.column.getColId() === 'gold' && Number(params.value) >= 8) {
            return {
                text: 'Flag this medal count for the performance review pack.',
            };
        }

        return undefined;
    },
};

const gridOptions: GridOptions<OlympicWinner> = {
    columnDefs,
    rowData,
    getRowId: ({ data }: GetRowIdParams<OlympicWinner>) => data.id,
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
    notesDataSource,
    defaultExcelExportParams,
};

function onBtExport() {
    gridApi.exportDataAsExcel();
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
