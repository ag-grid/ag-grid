import type {
    CellClickedEvent,
    CellNote,
    ColDef,
    GetNoteParams,
    GetRowIdParams,
    GridApi,
    GridOptions,
    NotesDataSource,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ContextMenuModule, NotesModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, ContextMenuModule, NotesModule, ValidationModule]);

type OlympicWinner = {
    id: string;
    athlete: string;
    age: number;
    country: string;
    year: number;
    sport: string;
};

declare global {
    interface Window {
        loadSelectedNote: () => void;
        saveSelectedNote: () => void;
        removeSelectedNote: () => void;
        mutateStoreDirectly: () => void;
        refreshSelectedNotes: () => void;
    }
}

let gridApi: GridApi<OlympicWinner>;
let selectedCell: GetNoteParams | undefined;

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

const gridOptions: GridOptions<OlympicWinner> = {
    columnDefs,
    rowData,
    getRowId: ({ data }: GetRowIdParams<OlympicWinner>) => data.id,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    notesDataSource,
    onCellClicked: (event: CellClickedEvent<OlympicWinner>) => {
        selectedCell = {
            rowNode: event.node,
            column: event.column,
        };

        loadSelectedNote();
    },
};

const getSelectionStatusElement = () => document.getElementById('selection-status') as HTMLElement;
const getAuthorInput = () => document.getElementById('note-author') as HTMLInputElement;
const getNoteTextArea = () => document.getElementById('note-text') as HTMLTextAreaElement;

const describeCell = (cell: GetNoteParams) =>
    `${cell.rowNode.data?.athlete ?? cell.rowNode.id} / ${cell.column.getColId()}`;

const setStatus = (message: string) => {
    getSelectionStatusElement().textContent = message;
};

const getSelectedCell = (): GetNoteParams | undefined => {
    if (!selectedCell) {
        setStatus('Click a cell to select it, then use the API controls.');
        return undefined;
    }

    return selectedCell;
};

function loadSelectedNote() {
    const cell = getSelectedCell();
    if (!cell || !gridApi) {
        return;
    }

    const note = gridApi.getCellNote(cell);
    getNoteTextArea().value = note?.text ?? '';
    getAuthorInput().value = (note?.author ?? getAuthorInput().value) || 'API Demo';

    setStatus(
        note
            ? `Loaded note for ${describeCell(cell)}.`
            : `No note stored for ${describeCell(cell)}. Type a note and save it via the API.`
    );
}

function saveSelectedNote() {
    const cell = getSelectedCell();
    if (!cell || !gridApi) {
        return;
    }

    const text = getNoteTextArea().value.trim();
    const author = getAuthorInput().value.trim();

    gridApi.setCellNote({
        ...cell,
        note: text
            ? {
                  text,
                  author: author || undefined,
                  updatedAt: getDisplayTimestamp(),
              }
            : undefined,
    });

    loadSelectedNote();
    setStatus(
        text
            ? `Saved note for ${describeCell(cell)} via gridApi.setCellNote().`
            : `Cleared note for ${describeCell(cell)} via gridApi.setCellNote().`
    );
}

function removeSelectedNote() {
    const cell = getSelectedCell();
    if (!cell || !gridApi) {
        return;
    }

    gridApi.removeCellNote(cell);
    loadSelectedNote();
    setStatus(`Removed note for ${describeCell(cell)} via gridApi.removeCellNote().`);
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

    noteStore.set(key, {
        ...(currentNote ?? {}),
        text: `${text} (external update)`,
        author,
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

    loadSelectedNote();
    setStatus(`Refreshed notes for ${describeCell(cell)} via gridApi.refreshCellNotes().`);
}

window.loadSelectedNote = loadSelectedNote;
window.saveSelectedNote = saveSelectedNote;
window.removeSelectedNote = removeSelectedNote;
window.mutateStoreDirectly = mutateStoreDirectly;
window.refreshSelectedNotes = refreshSelectedNotes;

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
