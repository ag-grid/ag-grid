import type { NamedBean } from '../context/bean';
import type { PopupEditorWrapper } from '../edit/cellEditors/popupEditorWrapper';
import type { AgEventType } from '../eventTypes';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { CellRange } from './IRangeService';
import type { ICellEditorParams } from './iCellEditor';
import type { Column } from './iColumn';
import type { EditMap } from './iEditModelService';
import type { IRowNode } from './iRowNode';
import type { UserCompDetails } from './iUserCompDetails';

type EditEvents = KeyboardEvent | MouseEvent | null;

export type StartEditParams = {
    key?: string | null;
    startedEdit?: boolean | null;
    event?: EditEvents;
    source?: 'api' | 'ui';
    silent?: boolean;
};

export type StopEditParams = {
    key?: string;
    event?: EditEvents;
    cancel?: boolean;
    source?: 'api' | 'ui';
    suppressNavigateAfterEdit?: boolean;
    shiftKey?: boolean;
};

export type IsEditingParams = {
    checkSiblings?: boolean;
    withOpenEditor?: boolean;
};

export type EditRowPosition = {
    rowNode?: IRowNode;
};

export type EditPosition = EditRowPosition & {
    column?: Column;
};

export interface IEditService extends NamedBean {
    batch: boolean;
    enableBatchEditing(): void;
    disableBatchEditing(): void;
    isEditing(params?: IsEditingParams | null): boolean;
    isEditing(position?: EditPosition | null, params?: IsEditingParams | null): boolean;
    isRowEditing(params?: IsEditingParams | null): boolean;
    isRowEditing(position?: EditRowPosition | null, params?: IsEditingParams | null): boolean;
    startEditing(position: Required<EditPosition>, params: StartEditParams): void;
    stopEditing(params?: StopEditParams): boolean;
    stopEditing(position?: EditPosition, params?: StopEditParams): boolean;
    stopAllEditing(cancel?: boolean, source?: 'api' | 'ui'): void;
    updateCells(
        updates?: EditMap,
        forcedState?: boolean | undefined,
        suppressFlash?: boolean,
        includeParents?: boolean
    ): void;
    setEdits(updates: EditMap): void;
    isCellEditable(position: Required<EditPosition>, source?: 'api' | 'ui'): boolean;
    moveToNextCell(
        previous: CellCtrl | RowCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source?: 'api' | 'ui'
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
}
