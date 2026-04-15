import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColKey } from '../entities/colDef';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { Column } from './iColumn';
import type { AgGridCommon } from './iCommon';
import type { IRowNode } from './iRowNode';

export interface Note {
    text: string;
    readOnly?: boolean;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface NoteParams {
    column: ColKey;
    rowNode: IRowNode;
    location?: 'cell';
}

export interface FullWidthRowNoteParams {
    rowNode: IRowNode;
    location: 'fullWidthRow';
    pinned?: 'left' | 'right';
}

export type GetNoteParams = NoteParams | FullWidthRowNoteParams;

export type SetNoteParams = GetNoteParams & {
    note: Note | undefined;
};

export interface NotesDataSourceNoteParams {
    column: Column;
    rowNode: IRowNode;
    location?: 'cell';
}

export interface NotesDataSourceFullWidthRowNoteParams {
    rowNode: IRowNode;
    location: 'fullWidthRow';
    pinned?: 'left' | 'right';
}

export type NotesDataSourceGetNoteParams = NotesDataSourceNoteParams | NotesDataSourceFullWidthRowNoteParams;

export type NotesDataSourceSetNoteParams = NotesDataSourceGetNoteParams & {
    note: Note | undefined;
};

export interface NotesDataSourceParams extends AgGridCommon<any, any> {}

/**
 * Control where notes are stored/retrieved from.
 * An implementation can store note state separately from the row data, or persist it remotely.
 */
export interface NotesDataSource {
    /** Initialise the data source so that the user can take a reference to the gridApi if needed. */
    init?(params: NotesDataSourceParams): void;
    /** Return the note for the given cell or full width row. */
    getNote(params: NotesDataSourceGetNoteParams): Note | undefined;
    /** Set or clear the note for the given cell or full width row. */
    setNote(params: NotesDataSourceSetNoteParams): void;
    /** Called by the grid when the data source is being disposed. */
    destroy?(): void;
}

export interface RefreshNotesParams {
    rowNodes?: IRowNode[];
    columns?: (string | Column)[];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface INoteAccess {
    params: GetNoteParams;
    rowNode: IRowNode;
    column: AgColumn;
    note: Note | undefined;
    isReadOnly: boolean;
    isSuppressed: boolean;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface INotesFeature {
    refresh(): void;
    show(params?: { focusEditor?: boolean; pinned?: 'left' | 'right' }): void;
    hide(save?: boolean): void;
    destroy(): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface INotesDataService extends Bean {
    hasDataSource(): boolean;
    getNote(params: GetNoteParams): Note | undefined;
    setNote(params: SetNoteParams): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface INotesService extends Bean {
    hasDataSource(): boolean;
    onDataSourceChanged(): void;
    createNotesFeature(ctrl: CellCtrl): INotesFeature | undefined;
    createFullWidthNotesFeature(ctrl: RowCtrl): INotesFeature | undefined;
    getNoteAccess(params: GetNoteParams): INoteAccess | undefined;
    getNote(params: GetNoteParams): Note | undefined;
    showNote(params: GetNoteParams, focusEditor?: boolean): boolean;
    setNote(params: SetNoteParams): void;
    refreshNotes(params?: RefreshNotesParams): void;
}
