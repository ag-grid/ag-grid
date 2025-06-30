import type { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _getRowById } from '../../entities/positionUtils';
import { _isElementInThisGrid } from '../../gridBodyComp/mouseEventUtils';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode, RowPinnedType } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _getTabIndex } from '../../utils/browser';
import { _destroyEditors } from './editors';

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

export function _getRowCtrl(beans: BeanCollection, inputs: ResolveRowControllerType = {}): RowCtrl | undefined {
    const { rowIndex, rowId, rowCtrl, rowPinned } = inputs;

    if (rowCtrl) {
        return rowCtrl;
    }

    const { rowModel, rowRenderer } = beans;

    let { rowNode } = inputs;
    rowNode ??= rowId ? _getRowById(beans, rowId, rowPinned) : rowModel.getRow(rowIndex!);

    return rowRenderer.getRowCtrls(rowNode ? [rowNode] : [])?.[0];
}

export function _getCellCtrl(beans: BeanCollection, inputs: ResolveControllerType = {}): CellCtrl | undefined {
    const { cellCtrl, colId, columnId, column } = inputs;

    if (cellCtrl) {
        return cellCtrl;
    }

    const actualColumn = beans.colModel.getCol(colId ?? columnId ?? _getColId(column))!;

    const rowCtrl = inputs.rowCtrl ?? _getRowCtrl(beans, inputs);
    const result = rowCtrl?.getCellCtrl(actualColumn) ?? undefined;

    if (result) {
        // if we found a cellCtrl, return it
        return result;
    }

    const rowNode = inputs.rowNode ?? rowCtrl?.rowNode;

    if (rowNode) {
        // can occur in spannedRow settings

        return beans.rowRenderer.getCellCtrls([rowNode], [actualColumn])?.[0];
    }

    return undefined;
}

export function _getCtrls(beans: BeanCollection, inputs: ResolveControllerType = {}): ResolvedControllersType {
    const rowCtrl = _getRowCtrl(beans, inputs);
    const cellCtrl = _getCellCtrl(beans, inputs);

    return {
        rowCtrl,
        cellCtrl,
    };
}

function _stopEditing(beans: BeanCollection): void {
    const { editSvc } = beans;
    if (editSvc?.isBatchEditing()) {
        _destroyEditors(beans);
    } else {
        editSvc?.stopEditing(undefined, { source: 'api' });
    }
}

export function _addStopEditingWhenGridLosesFocus(
    bean: BeanStub,
    beans: BeanCollection,
    viewports: HTMLElement[]
): void {
    const { gos, popupSvc } = beans;

    if (!gos.get('stopEditingWhenCellsLoseFocus')) {
        return;
    }

    const focusOutListener = (event: FocusEvent): void => {
        // this is the element the focus is moving to
        const elementWithFocus = event.relatedTarget as HTMLElement;

        if (_getTabIndex(elementWithFocus) === null) {
            _stopEditing(beans);
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
            _stopEditing(beans);
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
