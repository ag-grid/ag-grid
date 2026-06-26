import type {
    ColDef,
    GetRowIdParams,
    GridOptions,
    Note,
    NotesDataSource,
    NotesDataSourceGetNoteParams,
    NotesDataSourceSetNoteParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ContextMenuModule, NotesModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ContextMenuModule, NotesModule]);

type OlympicWinner = {
    id: string;
    athlete: string;
    age: number;
    country: string;
    year: number;
    sport: string;
};

const getNoteKey = (rowId: string, colId: string) => `${rowId}::${colId}`;

const noteStore = new Map<string, Note>([
    [
        getNoteKey('1', 'athlete'),
        {
            text: 'This note can still be edited from hover, the context menu, or Shift + F2.',
            author: 'AG Grid',
            updatedAt: '29 Mar 2026, 09:15',
        },
    ],
    [
        getNoteKey('3', 'country'),
        {
            text: 'This note is read-only, so the built-in UI opens it in view-only mode.',
            author: 'AG Grid',
            updatedAt: '27 Mar 2026, 14:30',
            readOnly: true,
        },
    ],
    [
        getNoteKey('5', 'sport'),
        {
            text: 'Read-only notes can still show metadata and can still be opened with Shift + F2.',
            updatedAt: '28 Mar 2026, 11:45',
            readOnly: true,
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
    { field: 'athlete' },
    { field: 'age', maxWidth: 110 },
    { field: 'country' },
    { field: 'year', maxWidth: 110 },
    { field: 'sport' },
];

const rowData: OlympicWinner[] = [
    { id: '1', athlete: 'Michael Phelps', age: 23, country: 'United States', year: 2008, sport: 'Swimming' },
    { id: '2', athlete: 'Usain Bolt', age: 22, country: 'Jamaica', year: 2008, sport: 'Athletics' },
    { id: '3', athlete: 'Simone Biles', age: 19, country: 'United States', year: 2016, sport: 'Gymnastics' },
    { id: '4', athlete: 'Katie Ledecky', age: 19, country: 'United States', year: 2016, sport: 'Swimming' },
    { id: '5', athlete: 'Allyson Felix', age: 30, country: 'United States', year: 2016, sport: 'Athletics' },
    { id: '6', athlete: 'Mo Farah', age: 33, country: 'Great Britain', year: 2016, sport: 'Athletics' },
];

const gridOptions: GridOptions<OlympicWinner> = {
    columnDefs,
    rowData,
    getRowId: ({ data }: GetRowIdParams<OlympicWinner>) => data.id,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    notesDataSource,
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
