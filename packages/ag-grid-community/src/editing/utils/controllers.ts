import type { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _getRowById } from '../../entities/positionUtils';
import type { RowNode } from '../../entities/rowNode';
import { _isElementInThisGrid } from '../../gridBodyComp/mouseEventUtils';
import type { Column } from '../../interfaces/iColumn';
import type { RowPinnedType } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _getTabIndex } from '../../utils/browser';

type ResolveRowControllerType = {
    rowIndex?: number | null;
    rowId?: string | null;
    rowCtrl?: RowCtrl | null;
    rowNode?: RowNode | null;
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
    let { rowNode } = inputs;

    if (rowCtrl) {
        return rowCtrl;
    }

    const { rowModel, rowRenderer } = beans;

    rowNode ??= rowId ? _getRowById(beans, rowId, rowPinned) : rowModel.getRow(rowIndex!); // TODO: what about pinned rows??

    if (!rowNode) {
        return undefined;
    }

    return rowRenderer.getRowCtrls([rowNode])?.[0];
}

export function _resolveCellController(beans: BeanCollection, inputs: ResolveControllerType): CellCtrl | undefined {
    const { cellCtrl } = inputs;

    if (cellCtrl) {
        return cellCtrl;
    }

    const { column, rowIndex, rowId } = inputs;
    const colId = inputs.colId ?? inputs.columnId;

    let { rowCtrl } = inputs;
    const { rowRenderer, colModel } = beans;

    const agColumn = colId
        ? colModel.getCol(colId)
        : colModel.getCol(typeof column === 'string' ? column : column?.getColId());

    rowCtrl ??= rowIndex || rowId ? _resolveRowController(beans, inputs) : rowRenderer.getRowCtrls()?.[0];
    return rowCtrl?.getCellCtrl(agColumn!) ?? undefined;
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
    beans: BeanCollection,
    viewports: HTMLElement[]
): void {
    if (!beans.gos.get('stopEditingWhenCellsLoseFocus')) {
        return;
    }

    const focusOutListener = (event: FocusEvent): void => {
        // this is the element the focus is moving to
        const elementWithFocus = event.relatedTarget as HTMLElement;

        if (_getTabIndex(elementWithFocus) === null) {
            beans.editingSvc?.stopAllEditing();
            return;
        }

        let clickInsideGrid =
            // see if click came from inside the viewports
            viewports.some((viewport) => viewport.contains(elementWithFocus)) &&
            // and also that it's not from a detail grid
            _isElementInThisGrid(beans.gos, elementWithFocus);

        if (!clickInsideGrid) {
            const popupSvc = beans.popupSvc;

            clickInsideGrid =
                !!popupSvc &&
                (popupSvc.getActivePopups().some((popup) => popup.contains(elementWithFocus)) ||
                    popupSvc.isElementWithinCustomPopup(elementWithFocus));
        }

        if (!clickInsideGrid) {
            beans.editingSvc?.stopAllEditing();
        }
    };

    viewports.forEach((viewport) => bean.addManagedElementListeners(viewport, { focusout: focusOutListener }));
}
