import type {
    CellClassParams,
    ColDef,
    GetRowIdParams,
    GridOptions,
    Note,
    NotesDataSource,
    NotesDataSourceGetNoteParams,
    NotesDataSourceSetNoteParams,
} from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ContextMenuModule, NotesModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([CellStyleModule, ClientSideRowModelModule, ContextMenuModule, NotesModule]);

interface OlympicWinner {
    id: string;
    athlete: string;
    age: number;
    country: string;
    year: number;
    sport: string;
}

interface NoteMetadata {
    type: 'team' | 'review' | 'personal';
    priority: 'high' | 'medium' | 'low';
}

const getNoteKey = (rowId: string, colId: string) => `${rowId}::${colId}`;

const defaultMetadataByColumn: Record<string, NoteMetadata> = {
    athlete: { type: 'team', priority: 'high' },
    country: { type: 'review', priority: 'medium' },
    sport: { type: 'personal', priority: 'low' },
};

const noteStore = new Map<string, Note<NoteMetadata>>([
    [
        getNoteKey('1', 'athlete'),
        {
            text: 'This team note needs a response before the next content review.',
            author: 'AG Grid',
            updatedAt: '29 Mar 2026, 09:15',
            metadata: { type: 'team', priority: 'high' },
        },
    ],
    [
        getNoteKey('3', 'country'),
        {
            text: 'This review note tracks external naming guidance for this country.',
            author: 'Chris',
            updatedAt: '27 Mar 2026, 14:30',
            metadata: { type: 'review', priority: 'medium' },
        },
    ],
    [
        getNoteKey('5', 'sport'),
        {
            text: 'This personal note is a lightweight reminder for later follow-up.',
            author: 'Martha',
            updatedAt: '28 Mar 2026, 11:45',
            metadata: { type: 'personal', priority: 'low' },
        },
    ],
]);

const getCellNoteMetadata = (rowId: string, colId: string): NoteMetadata | undefined =>
    noteStore.get(getNoteKey(rowId, colId))?.metadata;

const getNoteClasses = (metadata: NoteMetadata | undefined): string[] | undefined =>
    metadata ? [`note-type-${metadata.type}`, `note-priority-${metadata.priority}`] : undefined;

const notesDataSource: NotesDataSource<NoteMetadata> = {
    getNote: (params: NotesDataSourceGetNoteParams) =>
        noteStore.get(getNoteKey(params.rowNode.id!, params.column.getColId())),
    setNote: (params: NotesDataSourceSetNoteParams<NoteMetadata>) => {
        const key = getNoteKey(params.rowNode.id!, params.column.getColId());
        const existingNote = noteStore.get(key);

        if (params.note === undefined) {
            noteStore.delete(key);
        } else {
            noteStore.set(key, {
                ...existingNote,
                ...params.note,
                metadata: existingNote?.metadata ?? defaultMetadataByColumn[params.column.getColId()],
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
        cellClass: (params: CellClassParams<OlympicWinner>) =>
            getNoteClasses(getCellNoteMetadata(params.node.id!, params.column.getColId())),
    },
    notesDataSource,
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
