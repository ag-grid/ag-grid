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
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    metadata?: Record<string, unknown>;
}

export interface GetNoteParams {
    column: ColKey;
    rowNode: IRowNode;
}

export interface SetNoteParams extends GetNoteParams {
    note: CellNote | undefined;
}

export interface NotesDataSourceParams extends AgGridCommon<any, any> {}

/**
 * Control where cell notes are stored/retrieved from.
 * An implementation can store note state separately from the row data, or persist it remotely.
 */
export interface NotesDataSource {
    /** Initialise the data source so that the user can take a reference to the gridApi if needed. */
    init?(params: NotesDataSourceParams): void;
    /** Return the note for the given cell. */
    getNote(params: GetNoteParams): CellNote | undefined;
    /** Set or clear the note for the given cell. */
    setNote(params: SetNoteParams): void;
    /** Called by the grid when the data source is being disposed. */
    destroy?(): void;
}

export interface RefreshCellNotesParams {
    rowNodes?: IRowNode[];
    columns?: (string | Column)[];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ICellNotesFeature {
    refresh(): void;
    show(params?: { focusEditor?: boolean; column?: AgColumn }): void;
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
    createCellNotesFeature(ctrl: CellCtrl): ICellNotesFeature | undefined;
    createFullWidthRowNotesFeature(ctrl: RowCtrl): ICellNotesFeature | undefined;
    getCellNote(params: GetNoteParams): CellNote | undefined;
    showCellNoteEditor(params: GetNoteParams): void;
    setCellNote(params: SetNoteParams): void;
    removeCellNote(params: GetNoteParams): void;
    refreshCellNotes(params?: RefreshCellNotesParams): void;
}
