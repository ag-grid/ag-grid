import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColKey } from '../entities/colDef';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { Column } from './iColumn';
import type { AgGridCommon } from './iCommon';
import type { IRowNode } from './iRowNode';

export interface CellNote {
    text: string;
    readOnly?: boolean;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CellNoteParams {
    column: ColKey;
    rowNode: IRowNode;
    location?: 'cell';
}

export interface FullWidthRowNoteParams {
    rowNode: IRowNode;
    location: 'fullWidthRow';
    pinned?: 'left' | 'right';
}

export type GetNoteParams = CellNoteParams | FullWidthRowNoteParams;

export type SetNoteParams = GetNoteParams & {
    note: CellNote | undefined;
};

export interface NotesDataSourceCellNoteParams {
    column: Column;
    rowNode: IRowNode;
    location?: 'cell';
}

export interface NotesDataSourceFullWidthRowNoteParams {
    rowNode: IRowNode;
    location: 'fullWidthRow';
    pinned?: 'left' | 'right';
}

export type NotesDataSourceGetNoteParams = NotesDataSourceCellNoteParams | NotesDataSourceFullWidthRowNoteParams;

export type NotesDataSourceSetNoteParams = NotesDataSourceGetNoteParams & {
    note: CellNote | undefined;
};

export interface NotesDataSourceParams extends AgGridCommon<any, any> {}

/**
 * Control where cell notes are stored/retrieved from.
 * An implementation can store note state separately from the row data, or persist it remotely.
 */
export interface NotesDataSource {
    /** Initialise the data source so that the user can take a reference to the gridApi if needed. */
    init?(params: NotesDataSourceParams): void;
    /** Return the note for the given cell or full width row. */
    getNote(params: NotesDataSourceGetNoteParams): CellNote | undefined;
    /** Set or clear the note for the given cell or full width row. */
    setNote(params: NotesDataSourceSetNoteParams): void;
    /** Called by the grid when the data source is being disposed. */
    destroy?(): void;
}

export interface RefreshCellNotesParams {
    rowNodes?: IRowNode[];
    columns?: (string | Column)[];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ICellNoteAccess {
    params: GetNoteParams;
    rowNode: IRowNode;
    column: AgColumn;
    note: CellNote | undefined;
    isReadOnly: boolean;
    isSuppressed: boolean;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ICellNotesFeature {
    refresh(): void;
    show(params?: { focusEditor?: boolean; pinned?: 'left' | 'right' }): void;
    hide(save?: boolean): void;
    destroy(): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface INotesDataService extends Bean {
    hasDataSource(): boolean;
    getNote(params: GetNoteParams): CellNote | undefined;
    setNote(params: SetNoteParams): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface INotesService extends Bean {
    hasDataSource(): boolean;
    onDataSourceChanged(): void;
    createCellNotesFeature(ctrl: CellCtrl): ICellNotesFeature | undefined;
    createFullWidthRowNotesFeature(ctrl: RowCtrl): ICellNotesFeature | undefined;
    getCellNoteAccess(params: GetNoteParams): ICellNoteAccess | undefined;
    getCellNote(params: GetNoteParams): CellNote | undefined;
    showCellNote(params: GetNoteParams, focusEditor?: boolean): boolean;
    setCellNote(params: SetNoteParams): void;
    refreshCellNotes(params?: RefreshCellNotesParams): void;
}
