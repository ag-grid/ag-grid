import type { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _getRowById } from '../../entities/positionUtils';
import { RowNode } from '../../entities/rowNode';
import { _isElementInThisGrid } from '../../gridBodyComp/mouseEventUtils';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode, RowPinnedType } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _getTabIndex } from '../../utils/browser';

type ResolveRowControllerType = {
    rowIndex?: number | null;
    rowId?: string | null;
    rowCtrl?: RowCtrl | null;
    rowNode?: IRowNode | null;
    rowPinned?: RowPinnedType;
};

type ResolveCellControllerType = {
    colId?: string | null;
    columnId?: string | null;
    column?: string | Column | AgColumn | null;
    cellCtrl?: CellCtrl | null;
    rowPinned?: RowPinnedType;
};

type ResolveControllerType = ResolveRowControllerType & ResolveCellControllerType;

type ResolvedControllersType = {
    rowCtrl?: RowCtrl;
    cellCtrl?: CellCtrl;
};

export function _resolveRowController(beans: BeanCollection, inputs: ResolveRowControllerType): RowCtrl | undefined {
    const { rowIndex, rowId, rowCtrl, rowPinned } = inputs;

    if (rowCtrl) {
        return rowCtrl;
    }

    const { rowModel, rowRenderer } = beans;

    let { rowNode } = inputs;
    rowNode ??= rowId ? _getRowById(beans, rowId, rowPinned) : rowModel.getRow(rowIndex!);

    return rowRenderer.getRowCtrls(rowNode ? [rowNode] : [])?.[0];
}

export function _resolveCellController(beans: BeanCollection, inputs: ResolveControllerType): CellCtrl | undefined {
    const { cellCtrl, colId, columnId, column } = inputs;

    if (cellCtrl) {
        return cellCtrl;
    }

    const rowCtrl = inputs.rowCtrl ?? _resolveRowController(beans, inputs);
    return rowCtrl?.getCellCtrl(beans.colModel.getCol(colId ?? columnId ?? _getColId(column))!) ?? undefined;
}

export function _resolveControllers(beans: BeanCollection, inputs: ResolveControllerType): ResolvedControllersType {
    const rowCtrl = _resolveRowController(beans, inputs);
    const cellCtrl = _resolveCellController(beans, inputs);

    return {
        rowCtrl,
        cellCtrl,
    };
}

export function _addStopEditingWhenGridLosesFocus(
    bean: BeanStub,
    { editSvc, gos, popupSvc }: BeanCollection,
    viewports: HTMLElement[]
): void {
    if (!gos.get('stopEditingWhenCellsLoseFocus')) {
        return;
    }

    const focusOutListener = (event: FocusEvent): void => {
        // this is the element the focus is moving to
        const elementWithFocus = event.relatedTarget as HTMLElement;

        if (_getTabIndex(elementWithFocus) === null) {
            editSvc?.stopEditing();
            return;
        }

        let clickInsideGrid =
            // see if click came from inside the viewports
            viewports.some((viewport) => viewport.contains(elementWithFocus)) &&
            // and also that it's not from a detail grid
            _isElementInThisGrid(gos, elementWithFocus);

        if (!clickInsideGrid) {
            clickInsideGrid =
                !!popupSvc &&
                (popupSvc.getActivePopups().some((popup) => popup.contains(elementWithFocus)) ||
                    popupSvc.isElementWithinCustomPopup(elementWithFocus));
        }

        if (!clickInsideGrid) {
            editSvc?.stopEditing(undefined, undefined, undefined, undefined, false, 'api');
        }
    };

    viewports.forEach((viewport) => bean.addManagedElementListeners(viewport, { focusout: focusOutListener }));
}

export function _getColId(column?: Column | string | null): string | undefined {
    if (!column) {
        return undefined;
    }

    if (typeof column === 'string') {
        return column;
    }
    return column.getColId();
}

export function _getSiblingRows(
    beans: BeanCollection,
    rowNode: IRowNode,
    includeSource = false,
    includeParents = false
): IRowNode[] {
    const pinned = rowNode instanceof RowNode ? rowNode.pinnedSibling : undefined;
    const sibling = rowNode.sibling;

    const result: IRowNode[] = [];
    includeSource && result.push(rowNode);
    pinned && result.push(pinned);
    sibling && result.push(sibling);
    includeParents && result.push(..._getParentRows(beans, rowNode));

    return result;
}

export function _getParentRows(beans: BeanCollection, rowNode: IRowNode): IRowNode[] {
    const result: IRowNode[] = [];
    let parent = rowNode.parent;

    while (parent) {
        result.push(parent);
        parent = parent.parent;
    }

    return result;
}
