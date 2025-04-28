import type { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { _isElementInThisGrid } from '../../gridBodyComp/mouseEventUtils';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import type { Column } from '../../interfaces/iColumn';
import type { RowPinnedType } from '../../interfaces/iRowNode';
import type { CellCtrl, ICellComp } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _getTabIndex } from '../../utils/browser';
import { GridEditingModel } from '../model/gridEditingModel';

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

export function _getRowById(beans: BeanCollection, rowId: string, rowPinned?: RowPinnedType): RowNode | undefined {
    const { rowModel, pinnedRowModel } = beans;

    let rowNode;

    rowNode ??= rowModel?.getRowNode(rowId);

    if (rowPinned) {
        rowNode ??= pinnedRowModel?.getPinnedRowById(rowId, rowPinned!);
    } else {
        rowNode ??= pinnedRowModel?.getPinnedRowById(rowId, 'top');
        rowNode ??= pinnedRowModel?.getPinnedRowById(rowId, 'bottom');
    }

    return rowNode;
}

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

export function _takeValueFromCellEditor(
    cancel: boolean,
    cellComp: ICellComp
): { newValue?: any; newValueExists: boolean } {
    const noValueResult = { newValueExists: false };

    if (cancel) {
        return noValueResult;
    }

    const cellEditor = cellComp.getCellEditor();

    if (!cellEditor) {
        return noValueResult;
    }

    const userWantsToCancel = cellEditor.isCancelAfterEnd && cellEditor.isCancelAfterEnd();

    if (userWantsToCancel) {
        return noValueResult;
    }

    const newValue = cellEditor.getValue();

    return {
        newValue: newValue,
        newValueExists: true,
    };
}

/**
 * @returns `True` if the value changes, otherwise `False`.
 */
export function _saveNewValue(
    cellCtrl: CellCtrl,
    oldValue: any,
    newValue: any,
    rowNode: RowNode,
    column: AgColumn
): boolean {
    if (newValue === oldValue) {
        return false;
    }

    // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
    // getting triggered, which results in all cells getting refreshed. we do not want this refresh
    // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
    // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
    cellCtrl.suppressRefreshCell = true;
    const valueChanged = rowNode.setDataValue(column, newValue, 'edit');
    cellCtrl.suppressRefreshCell = false;

    return valueChanged;
}

export function _createCellEditorParams(
    beans: BeanCollection,
    cellCtrl: CellCtrl,
    key?: string | null,
    cellStartedEdit?: boolean | null
): ICellEditorParams {
    const {
        column,
        rowNode,
        cellPosition: { rowIndex },
    } = cellCtrl;
    const { valueSvc, gos, editingSvc } = beans;

    return _addGridCommonParams(gos, {
        value: valueSvc.getValueForDisplay(column, rowNode)?.value,
        eventKey: key ?? null,
        column,
        colDef: column.getColDef(),
        rowIndex,
        node: rowNode,
        data: rowNode.data,
        cellStartedEdit: cellStartedEdit ?? false,
        onKeyDown: cellCtrl.onKeyDown.bind(cellCtrl),
        stopEditing: (_suppressNavigateAfterEdit) => editingSvc!.stopEditing(cellCtrl.rowCtrl, cellCtrl),
        eGridCell: cellCtrl.eGui,
        parseValue: (newValue: any) => valueSvc.parseValue(column, rowNode, newValue, cellCtrl.value),
        formatValue: cellCtrl.formatValue.bind(cellCtrl),
    });
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

export function _updatePendingValue(beans: BeanCollection, gridEditModel: GridEditingModel): void {
    gridEditModel.getEditingCellIds().forEach((cellId) => {
        const { rowId, columnId } = cellId;
        const cellCtrl = _resolveCellController(beans, { rowId, columnId });
        const { comp, rowNode, column } = cellCtrl!;

        const { newValue, newValueExists } = _takeValueFromCellEditor(false, comp);

        if (!newValueExists) {
            return;
        }

        gridEditModel.getEditModels(rowId!, column.colId).forEach((editModel) => {
            const oldValue = beans.valueSvc.getValueForDisplay(column, rowNode)?.value;
            editModel.newValue = newValue;
            editModel.oldValue = oldValue;
        });
    });
}
