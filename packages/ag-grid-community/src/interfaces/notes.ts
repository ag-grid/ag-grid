import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColKey } from '../entities/colDef';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { Column } from './iColumn';
import type { AgGridCommon } from './iCommon';
import type { IRowNode } from './iRowNode';

export interface Note<TMetadata = any> {
    /** Text content of the note. */
    text: string;
    /** Set to `true` to make this note readonly. */
    readOnly?: boolean;
    /** Optional author of the note. */
    author?: string;
    /** Optional creation timestamp. */
    createdAt?: string;
    /** Optional updated timestamp. */
    updatedAt?: string;
    /** Optional application metadata to be associated with this note. */
    metadata?: TMetadata;
}

export interface NoteParams {
    /** Column that the note is for. */
    column: ColKey;
    /** Row that the note is for. */
    rowNode: IRowNode;
    /** If using fullWidthRows the location is `cell` for normal cells. */
    location?: 'cell';
}

export interface FullWidthRowNoteParams {
    /** Full width row */
    rowNode: IRowNode;
    /** Location is `fullWidthRow` for full width row notes. */
    location: 'fullWidthRow';
    /** If `embedFullWidthRows=true` identifies the pinned section the note has been applied to. */
    pinned?: 'left' | 'right';
}

export type GetNoteParams = NoteParams | FullWidthRowNoteParams;

export type SetNoteParams<TMetadata = any> = GetNoteParams & {
    /** Note to be saved. */
    note: Note<TMetadata> | undefined;
};

export interface NotesDataSourceNoteParams {
    /** Column for the note. */
    column: Column;
    /** Row for the note. */
    rowNode: IRowNode;
    /** Location of the note. */
    location?: 'cell';
}

export interface NotesDataSourceFullWidthRowNoteParams {
    /** Row for the note. */
    rowNode: IRowNode;
    /** Location of the note. */
    location: 'fullWidthRow';
    /** If `embedFullWidthRows=true` identifies the pinned section the note has been applied to. */
    pinned?: 'left' | 'right';
}

export type NotesDataSourceGetNoteParams = NotesDataSourceNoteParams;

export interface NotesDataSourceSetNoteParams<TMetadata = any> extends NotesDataSourceNoteParams {
    /** Note to be saved. */
    note: Note<TMetadata> | undefined;
}

export type FullWidthNotesDataSourceGetNoteParams = NotesDataSourceNoteParams | NotesDataSourceFullWidthRowNoteParams;

export type FullWidthNotesDataSourceSetNoteParams<TMetadata = any> =
    | NotesDataSourceSetNoteParams<TMetadata>
    | (NotesDataSourceFullWidthRowNoteParams & {
          /** Note to be saved. */
          note: Note<TMetadata> | undefined;
      });

export interface NotesDataSourceParams extends AgGridCommon<any, any> {}

interface BaseNotesDataSource {
    /** Initialise the data source so that the user can take a reference to the gridApi if needed. */
    init?(params: NotesDataSourceParams): void;
    /** Called by the grid when the data source is being disposed. */
    destroy?(): void;
}

/**
 * Control where notes are stored/retrieved from.
 * An implementation can store note state separately from the row data, or persist it remotely.
 */
export interface NotesDataSource<TMetadata = any> extends BaseNotesDataSource {
    /** Return the note for the given cell. */
    getNote(params: NotesDataSourceGetNoteParams): Note<TMetadata> | undefined;
    /** Set or clear the note for the given cell. */
    setNote(params: NotesDataSourceSetNoteParams<TMetadata>): void;
}

/**
 * Control where notes are stored/retrieved from for both cells and full width rows.
 */
export interface FullWidthNotesDataSource<TMetadata = any> extends BaseNotesDataSource {
    /** Enables full width row notes for this datasource. */
    supportsFullWidthRows: true;
    /** Return the note for the given cell or full width row. */
    getNote(params: FullWidthNotesDataSourceGetNoteParams): Note<TMetadata> | undefined;
    /** Set or clear the note for the given cell or full width row. */
    setNote(params: FullWidthNotesDataSourceSetNoteParams<TMetadata>): void;
}

export interface RefreshNotesParams {
    /** Only refresh the provided rowNodes. If `undefined` refresh all rows. */
    rowNodes?: IRowNode[];
    /** Only refresh the provided columns. If `undefined` refresh all columns. */
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
    supportsFullWidthRows(): boolean;
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
