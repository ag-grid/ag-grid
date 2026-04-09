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

const getCellNoteKey = (rowId: string, colId: string) => `${rowId}::${colId}`;
const getDisplayTimestamp = () =>
    new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date());
const getCurrentUser = () => {
    const user = (document.getElementById('current-user') as HTMLInputElement | null)?.value.trim();
    return user || undefined;
};

const noteStore = new Map<string, CellNote>([
    [
        getCellNoteKey('1', 'athlete'),
        {
            text: 'Confirm the athlete biography before the next review.',
            author: 'AG Grid',
            createdAt: '26 Mar 2026, 10:30',
            updatedAt: '29 Mar 2026, 09:15',
        },
    ],
    [
        getCellNoteKey('3', 'country'),
        {
            text: 'Check the latest federation naming guidance for this country.',
            author: 'Chris',
            createdAt: '24 Mar 2026, 16:10',
            updatedAt: '27 Mar 2026, 14:30',
        },
    ],
]);

const notesDataSource: NotesDataSource = {
    getNote: (params) =>
        'column' in params ? noteStore.get(getCellNoteKey(params.rowNode.id!, params.column.getColId())) : undefined,
    setNote: (params) => {
        if (!('column' in params)) {
            return;
        }

        const key = getCellNoteKey(params.rowNode.id!, params.column.getColId());
        const existingNote = noteStore.get(key);

        if (params.note === undefined) {
            noteStore.delete(key);
        } else {
            noteStore.set(key, {
                ...existingNote,
                ...params.note,
                author: getCurrentUser(),
                createdAt: existingNote?.createdAt ?? getDisplayTimestamp(),
                updatedAt: getDisplayTimestamp(),
            });
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
