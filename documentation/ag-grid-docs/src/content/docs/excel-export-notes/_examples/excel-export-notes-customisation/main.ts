import type {
    ColDef,
    GetRowIdParams,
    GridApi,
    GridOptions,
    Note,
    NotesDataSource,
    NotesDataSourceGetNoteParams,
    NotesDataSourceSetNoteParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ContextMenuModule, ExcelExportModule, NotesModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ContextMenuModule, ExcelExportModule, NotesModule]);

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

const gridOptions: GridOptions<OlympicWinner> = {
    columnDefs,
    rowData,
    getRowId: ({ data }: GetRowIdParams<OlympicWinner>) => data.id,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    notesDataSource,
    defaultExcelExportParams: {
        author: 'Portfolio Ops',
        processNoteCallback: (params) => {
            if (params.excelNote) {
                return {
                    ...params.excelNote,
                    text: `${params.excelNote.text}\n\nUpdated: ${params.gridNote?.updatedAt ?? 'Not recorded'}`,
                };
            }

            // Export a note to Excel for which there is not an existing gridNote
            if (params.column.getColId() === 'gold' && Number(params.value) >= 8) {
                return {
                    text: 'Flag this medal count for the performance review pack.',
                };
            }
        },
    },
};

function onBtExport() {
    gridApi.exportDataAsExcel();
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
