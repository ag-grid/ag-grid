import type {
    CellClickedEvent,
    CellNote,
    ColDef,
    Column,
    GetRowIdParams,
    GridApi,
    GridOptions,
    IRowNode,
    NotesDataSource,
} from 'ag-grid-community';
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

let gridApi: GridApi<OlympicWinner>;

type SelectedCell = {
    rowNode: IRowNode<OlympicWinner>;
    column: Column;
};

const getNoteKey = (rowId: string, colId: string) => `${rowId}::${colId}`;
const getDisplayTimestamp = () =>
    new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date());

const noteStore = new Map<string, CellNote>([
    [
        getNoteKey('2', 'athlete'),
        {
            text: 'Follow up with the regional team before publishing this profile.',
            author: 'Martha',
            updatedAt: '29 Mar 2026, 09:15',
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
    onCellClicked: (event: CellClickedEvent<OlympicWinner>) => {
        const win = window as any;
        win.selectedCell = {
            rowNode: event.node,
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
const areNotesEqual = (left: CellNote | undefined, right: CellNote | undefined) =>
    JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

const setStatus = (message: string) => {
    getSelectionStatusElement().textContent = message;
};

const getSelectedCell = (): SelectedCell | undefined => {
    const win = window as any;
    const selectedCell = win.selectedCell as SelectedCell | undefined;

    if (!selectedCell) {
        setStatus('Click a cell to select it, then use the API controls.');
        return undefined;
    }

    return selectedCell;
};

const syncNote = (gridApi: GridApi<OlympicWinner>) => {
    const cell = getSelectedCell();
    if (!cell || !gridApi) {
        return;
    }

    const note = gridApi.getCellNote(cell);
    getNoteTextArea().value = note?.text ?? '';
    getAuthorInput().value = (note?.author ?? getAuthorInput().value) || 'API Demo';
    getReadOnlyInput().checked = !!note?.readOnly;

    setStatus(
        note
            ? `Loaded note for ${describeCell(cell)}.`
            : `No note stored for ${describeCell(cell)}. Type a note and save it via the API.`
    );
};

function loadSelectedNote() {
    syncNote(gridApi);
}

function saveSelectedNote() {
    const cell = getSelectedCell();
    if (!cell || !gridApi) {
        return;
    }

    const previousNote = gridApi.getCellNote(cell);
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

    gridApi.setCellNote({
        ...cell,
        note: nextNote,
    });

    const updatedNote = gridApi.getCellNote(cell);
    syncNote(gridApi);

    if (previousNote?.readOnly && areNotesEqual(previousNote, updatedNote)) {
        setStatus(`The existing note for ${describeCell(cell)} is read-only, so gridApi.setCellNote() had no effect.`);
        return;
    }

    setStatus(
        text
            ? `Saved note for ${describeCell(cell)} via gridApi.setCellNote().`
            : `Removed note for ${describeCell(cell)} via gridApi.setCellNote().`
    );
}

function removeSelectedNote() {
    const cell = getSelectedCell();
    if (!cell || !gridApi) {
        return;
    }

    const previousNote = gridApi.getCellNote(cell);
    gridApi.setCellNote({
        ...cell,
        note: undefined,
    });
    const updatedNote = gridApi.getCellNote(cell);
    syncNote(gridApi);

    if (previousNote?.readOnly && areNotesEqual(previousNote, updatedNote)) {
        setStatus(
            `The existing note for ${describeCell(cell)} is read-only, so removing it via gridApi.setCellNote() had no effect.`
        );
        return;
    }

    setStatus(`Removed note for ${describeCell(cell)} via gridApi.setCellNote().`);
}

function mutateStoreDirectly() {
    const cell = getSelectedCell();
    if (!cell) {
        return;
    }

    const key = getNoteKey(cell.rowNode.id!, cell.column.getColId());
    const currentNote = noteStore.get(key);
    const author = getAuthorInput().value.trim() || 'External Store';
    const text = getNoteTextArea().value.trim() || currentNote?.text || 'Updated outside the grid';
    const readOnly = getReadOnlyInput().checked;

    noteStore.set(key, {
        ...(currentNote ?? {}),
        text: `${text} (external update)`,
        author,
        readOnly: readOnly || undefined,
        updatedAt: getDisplayTimestamp(),
    });

    setStatus(`Updated the store directly for ${describeCell(cell)}. Call refreshCellNotes() to sync the grid.`);
}

function refreshSelectedNotes() {
    const cell = getSelectedCell();
    if (!cell || !gridApi) {
        return;
    }

    gridApi.refreshCellNotes({
        rowNodes: [cell.rowNode],
        columns: [cell.column],
    });

    syncNote(gridApi);
    setStatus(`Refreshed notes for ${describeCell(cell)} via gridApi.refreshCellNotes().`);
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
