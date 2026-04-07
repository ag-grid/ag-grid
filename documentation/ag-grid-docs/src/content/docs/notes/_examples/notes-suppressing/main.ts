import type { CellNote, ColDef, GetRowIdParams, GridOptions, NotesDataSource } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ContextMenuModule, NotesModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ContextMenuModule,
    NotesModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

type OlympicWinner = {
    id: string;
    athlete: string;
    age: number;
    country: string;
    year: number;
    sport: string;
};

const getNoteKey = (rowId: string, colId: string) => `${rowId}::${colId}`;

const noteStore = new Map<string, CellNote>([
    [
        getNoteKey('1', 'athlete'),
        {
            text: 'This cell still allows the full built-in note workflow.',
            updatedAt: '29 Mar 2026, 09:15',
        },
    ],
    [
        getNoteKey('2', 'year'),
        {
            text: 'Year suppresses note actions, but existing notes still open on hover.',
            updatedAt: '28 Mar 2026, 11:45',
        },
    ],
    [
        getNoteKey('5', 'sport'),
        {
            text: 'Sport also suppresses note actions for the entire column.',
            updatedAt: '27 Mar 2026, 14:30',
        },
    ],
]);

const notesDataSource: NotesDataSource = {
    getNote: ({ rowNode, column }) => noteStore.get(getNoteKey(rowNode.id!, column.getColId())),
    setNote: ({ rowNode, column, note }) => {
        const key = getNoteKey(rowNode.id!, column.getColId());

        if (note === undefined) {
            noteStore.delete(key);
        } else {
            noteStore.set(key, note);
        }
    },
};

const columnDefs: ColDef<OlympicWinner>[] = [
    { field: 'athlete' },
    { field: 'age', maxWidth: 110 },
    { field: 'country' },
    { field: 'year', maxWidth: 110, suppressCellNoteEditing: true },
    { field: 'sport', suppressCellNoteEditing: true },
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
