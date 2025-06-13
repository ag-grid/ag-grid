import type { NamedBean } from '../context/bean';
import type { BeanCollection } from '../context/context';
import type { PopupEditorWrapper } from '../edit/cellEditors/popupEditorWrapper';
import { AgColumn } from '../entities/agColumn';
import type { AgEventType } from '../eventTypes';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { CellRange } from './IRangeService';
import type {
    EditingCellPosition,
    ICellEditorParams,
    ICellEditorValidationError,
    SetEditingCellsParams,
} from './iCellEditor';
import type { ICellStyleFeature } from './iCellStyleFeature';
import type { Column } from './iColumn';
import type { EditMap } from './iEditModelService';
import type { IRowNode } from './iRowNode';
import type { IRowStyleFeature } from './iRowStyleFeature';
import type { UserCompDetails } from './iUserCompDetails';

type EditEvents = KeyboardEvent | MouseEvent | null;

export type EditSource = 'api' | 'ui' | 'paste' | 'rangeSvc' | 'fillHandle' | 'cellClear';

export type StartEditParams = {
    startedEdit?: boolean | null;
    event?: EditEvents;
    source?: EditSource;
    silent?: boolean;
    ignoreEventKey?: boolean;
};

export type StopEditParams = {
    event?: EditEvents;
    cancel?: boolean;
    source?: EditSource;
    suppressNavigateAfterEdit?: boolean;
};

export type IsEditingParams = {
    checkSiblings?: boolean;
    withOpenEditor?: boolean;
};

export type EditRowPosition = {
    rowNode?: IRowNode;
};

export interface EditPosition extends EditRowPosition {
    column?: Column;
}

export function _isEditPosition(pos: any): pos is EditPosition {
    return pos && typeof pos.rowNode === 'object' && (pos.column === undefined || pos.column instanceof AgColumn);
}

export function _isEditRowPosition(pos: any): pos is EditRowPosition {
    return pos && typeof pos.rowNode === 'object';
}
export interface IEditService extends NamedBean {
    shouldStartEditing(
        position: Required<EditPosition>,
        event?: KeyboardEvent | MouseEvent | null,
        cellStartedEdit?: boolean | null,
        source?: EditSource
    ): boolean | null;

    shouldStopEditing(
        position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source?: EditSource
    ): boolean | null;

    shouldCancelEditing(
        position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source?: EditSource
    ): boolean | null;

    setBatchEditing(enabled: boolean): void;
    isBatchEditing(): boolean;
    isEditing(position?: EditPosition | null, params?: IsEditingParams | null): boolean;
    isRowEditing(position?: EditRowPosition | null, params?: IsEditingParams | null): boolean;
    startEditing(position: Required<EditPosition>, params: StartEditParams): void;
    stopEditing(position?: EditPosition, params?: StopEditParams): boolean;
    stopAllEditing(cancel?: boolean, source?: EditSource): void;
    setEditMap(updates: EditMap): void;
    isCellEditable(position: Required<EditPosition>, source?: EditSource): boolean;
    moveToNextCell(
        previous: CellCtrl | RowCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source?: EditSource
    ): boolean | null;
    getCellDataValue(position: Required<EditPosition>): any;
    addStopEditingWhenGridLosesFocus(viewports: HTMLElement[]): void;
    createPopupEditorWrapper(params: ICellEditorParams): PopupEditorWrapper;
    setDataValue(position: Required<EditPosition>, newValue: any, eventSource?: string): boolean | undefined;
    handleColDefChanged(cellCtrl: CellCtrl): void;
    prepDetailsDuringBatch(
        position: Required<EditPosition>,
        params: { compDetails?: UserCompDetails<any>; valueToDisplay: any }
    ): { compDetails?: UserCompDetails<any>; valueToDisplay?: any } | undefined;
    cleanupEditors(): void;
    dispatchCellEvent<T extends AgEventType>(
        position: Required<EditPosition>,
        event?: Event | null,
        type?: T,
        payload?: any
    ): void;
    dispatchRowEvent(position: Required<EditRowPosition>, type: 'rowEditingStarted' | 'rowEditingStopped'): void;
    applyBulkEdit(position: Required<EditPosition>, cellRanges: CellRange[]): void;
    validateEdit(): ICellEditorValidationError[] | null;
    createCellStyleFeature(cellCtrl: CellCtrl, beans: BeanCollection): ICellStyleFeature;
    createRowStyleFeature(rowCtrl: RowCtrl, beans: BeanCollection): IRowStyleFeature;
    setEditingCells(cells: EditingCellPosition[], params?: SetEditingCellsParams): void;
}
