import type {
    CellFocusedEvent,
    ColDef,
    Column,
    GetRowIdParams,
    GridApi,
    GridOptions,
    IRowNode,
    Note,
    NotesDataSource,
    NotesDataSourceGetNoteParams,
    NotesDataSourceSetNoteParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ContextMenuModule, NotesModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ContextMenuModule, NotesModule, RowApiModule]);

type OlympicWinner = {
    id: string;
    athlete: string;
    age: number;
    country: string;
    year: number;
    sport: string;
};

let gridApi: GridApi<OlympicWinner>;

type SelectedCell = {
    rowNode: IRowNode<OlympicWinner>;
    column: Column;
};

const getDisplayTimestamp = () =>
    new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date());

const noteStore: Record<string, Record<string, Note>> = {
    '2': {
        athlete: {
            text: 'Follow up with the regional team before publishing this profile.',
            author: 'Martha',
            readOnly: true,
            updatedAt: '29 Mar 2026, 09:15',
        },
    },
};

const notesDataSource: NotesDataSource = {
    getNote: (params: NotesDataSourceGetNoteParams) => noteStore[params.rowNode.id!]?.[params.column.getColId()],
    setNote: (params: NotesDataSourceSetNoteParams) => {
        const rowId = params.rowNode.id!;
        const colId = params.column.getColId();

        if (params.note === undefined) {
            delete noteStore[rowId]?.[colId];
        } else {
            const row = (noteStore[rowId] ??= {});
            row[colId] = params.note;
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

const getRowId = ({ data }: GetRowIdParams<OlympicWinner>) => data.id;

const gridOptions: GridOptions<OlympicWinner> = {
    columnDefs,
    rowData,
    getRowId,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    notesDataSource,
    onCellFocused: (event: CellFocusedEvent<OlympicWinner>) => {
        const win = window as any;
        win.selectedCell = {
            rowNode: gridApi.getDisplayedRowAtIndex(event.rowIndex!),
            column: event.column,
        };

        syncNote(gridApi);
    },
};

const getSelectionStatusElement = () => document.getElementById('selection-status') as HTMLElement;
const getAuthorInput = () => document.getElementById('note-author') as HTMLInputElement;
const getNoteTextArea = () => document.getElementById('note-text') as HTMLTextAreaElement;
const getReadOnlyInput = () => document.getElementById('note-readonly') as HTMLInputElement;

const describeCell = (cell: SelectedCell) =>
    `${cell.rowNode.data?.athlete ?? cell.rowNode.id} / ${cell.column.getColId()}`;

const setStatus = (message: string) => {
    getSelectionStatusElement().textContent = message;
};

const getSelectedCell = (): SelectedCell | undefined => {
    const win = window as any;
    const selectedCell = win.selectedCell as SelectedCell | undefined;

    if (!selectedCell) {
        setStatus('No cell selected.');
        return undefined;
    }

    return selectedCell;
};

const syncNote = (gridApi: GridApi<OlympicWinner>) => {
    const cell = getSelectedCell();
    if (!cell || !gridApi) {
        return;
    }

    const note = gridApi.getNote(cell);
    getNoteTextArea().value = note?.text ?? '';
    getAuthorInput().value = (note?.author ?? getAuthorInput().value) || 'API Demo';
    getReadOnlyInput().checked = !!note?.readOnly;

    setStatus(note ? `Loaded note for ${describeCell(cell)}.` : `No note stored for ${describeCell(cell)}.`);
};

function saveSelectedNote() {
    const cell = getSelectedCell();
    if (!cell || !gridApi) {
        return;
    }

    const text = getNoteTextArea().value.trim();
    const author = getAuthorInput().value.trim();
    const readOnly = getReadOnlyInput().checked;
    const nextNote = text
        ? {
              text,
              author: author || undefined,
              readOnly: readOnly || undefined,
              updatedAt: getDisplayTimestamp(),
          }
        : undefined;

    gridApi.setNote({
        ...cell,
        note: nextNote,
    });

    syncNote(gridApi);

    setStatus(
        text
            ? `Saved note for ${describeCell(cell)} via gridApi.setNote().`
            : `Removed note for ${describeCell(cell)} via gridApi.setNote().`
    );
}

function removeSelectedNote() {
    const cell = getSelectedCell();
    if (!cell || !gridApi) {
        return;
    }

    gridApi.setNote({
        ...cell,
        note: undefined,
    });
    syncNote(gridApi);

    setStatus(`Removed note for ${describeCell(cell)} via gridApi.setNote().`);
}

function mutateStoreDirectly() {
    const cell = getSelectedCell();
    if (!cell) {
        return;
    }

    const rowId = cell.rowNode.id!;
    const colId = cell.column.getColId();
    const currentNote = noteStore[rowId]?.[colId];
    const author = getAuthorInput().value.trim() || 'External Store';
    const text = getNoteTextArea().value.trim() || currentNote?.text || 'Updated outside the grid';
    const readOnly = getReadOnlyInput().checked;

    const row = (noteStore[rowId] ??= {});
    row[colId] = {
        ...(currentNote ?? {}),
        text: `${text} (external update)`,
        author,
        readOnly: readOnly || undefined,
        updatedAt: getDisplayTimestamp(),
    };

    setStatus(`Updated the store directly for ${describeCell(cell)}.`);
}

function refreshSelectedNotes() {
    const cell = getSelectedCell();
    if (!cell || !gridApi) {
        return;
    }

    gridApi.refreshNotes({
        rowNodes: [cell.rowNode],
        columns: [cell.column],
    });

    syncNote(gridApi);
    setStatus(`Refreshed notes for ${describeCell(cell)} via gridApi.refreshNotes().`);
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
