import type { GridOptionsService } from '../gridOptionsService';
import { _addGridCommonParams, _getDomData } from '../gridOptionsUtils';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import type { CellCtrl } from './cell/cellCtrl';
import type {
    EventCellRendererParams,
    ICellRendererParams,
    SuppressMouseEventHandlingParams,
} from './cellRenderers/iCellRenderer';
import type { RowCtrl } from './row/rowCtrl';

export function _suppressCellMouseEvent(
    gos: GridOptionsService,
    column: Column,
    node: IRowNode,
    event: MouseEvent
): boolean {
    const suppressMouseEventHandling = (column.getColDef().cellRendererParams as EventCellRendererParams)
        ?.suppressMouseEventHandling;
    return suppressMouseEvent(gos, column, node, event, suppressMouseEventHandling);
}

export function _suppressFullWidthMouseEvent(
    gos: GridOptionsService,
    cellRendererParams: ICellRendererParams | undefined,
    node: IRowNode,
    event: MouseEvent
): boolean {
    const suppressMouseEventHandling = (cellRendererParams as EventCellRendererParams)?.suppressMouseEventHandling;
    return suppressMouseEvent(gos, undefined, node, event, suppressMouseEventHandling);
}

function suppressMouseEvent(
    gos: GridOptionsService,
    column: Column | undefined,
    node: IRowNode,
    event: MouseEvent,
    suppressMouseEventHandling?: (params: SuppressMouseEventHandlingParams) => boolean
): boolean {
    if (!suppressMouseEventHandling) {
        return false;
    }
    return suppressMouseEventHandling(
        _addGridCommonParams(gos, {
            column,
            node,
            event,
        })
    );
}

function _getCtrlForEventTarget<T>(gos: GridOptionsService, eventTarget: EventTarget | null, type: string): T | null {
    let sourceElement = eventTarget as HTMLElement;

    while (sourceElement) {
        const renderedComp = _getDomData(gos, sourceElement, type);

        if (renderedComp) {
            return renderedComp as T;
        }

        sourceElement = sourceElement.parentElement!;
    }

    return null;
}

export const DOM_DATA_KEY_CELL_CTRL = 'cellCtrl';

export function _getCellCtrlForEventTarget(gos: GridOptionsService, eventTarget: EventTarget | null): CellCtrl | null {
    return _getCtrlForEventTarget(gos, eventTarget, DOM_DATA_KEY_CELL_CTRL);
}

export const DOM_DATA_KEY_ROW_CTRL = 'renderedRow';

export function _getRowCtrlForEventTarget(gos: GridOptionsService, eventTarget: EventTarget | null): RowCtrl | null {
    return _getCtrlForEventTarget(gos, eventTarget, DOM_DATA_KEY_ROW_CTRL);
}
