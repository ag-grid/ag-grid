import { KeyCode } from 'ag-stack';

import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { ColDef } from '../../entities/colDef';
import type { GridOptionsService } from '../../gridOptionsService';
import type { EditPosition, EditSource } from '../../interfaces/iEditService';

/** File is used to contain logic about whether a strategy is required.
 * This enables us to perform editing related checks without the overhead of creating the strategies and their event listeners.
 */

export function shouldStartEditing(
    beans: BeanCollection,
    { column }: Required<EditPosition>,
    event?: KeyboardEvent | MouseEvent | null,
    cellStartedEdit?: boolean | null,
    source: EditSource = 'ui'
): boolean {
    if (
        event instanceof KeyboardEvent &&
        (event.key === KeyCode.TAB ||
            event.key === KeyCode.ENTER ||
            event.key === KeyCode.F2 ||
            (event.key === KeyCode.BACKSPACE && cellStartedEdit))
    ) {
        return true;
    }

    const extendingRange = event?.shiftKey && beans.rangeSvc?.getCellRanges().length != 0;
    if (extendingRange) {
        return false;
    }

    const colDef = column?.getColDef();
    const clickCount = deriveClickCount(beans.gos, colDef);
    const type = event?.type;

    if (type === 'click' && event?.detail === 1 && clickCount === 1) {
        return true;
    }

    if (type === 'dblclick' && event?.detail === 2 && clickCount === 2) {
        return true;
    }

    if (source === 'api') {
        return !!cellStartedEdit;
    }

    return false;
}

function deriveClickCount(gos: GridOptionsService, colDef?: ColDef): number {
    if (gos.get('suppressClickEdit') === true) {
        return 0;
    }

    if (gos.get('singleClickEdit') === true) {
        return 1;
    }

    if (colDef?.singleClickEdit) {
        return 1;
    }

    return 2;
}

function existingEditing(beans: BeanCollection, editPosition: Required<EditPosition>): boolean {
    return beans.editModelSvc?.hasEdits(editPosition, { withOpenEditor: true }) ?? false;
}

export function isCellEditable(beans: BeanCollection, editPosition: Required<EditPosition>): boolean {
    const column = editPosition.column as AgColumn;
    const rowNode = editPosition.rowNode;
    const colDef = column.getColDef();

    if (column.isCalculatedCol) {
        return false;
    }

    if (!rowNode) {
        return existingEditing(beans, editPosition);
    }

    const editable = colDef.editable;

    if (rowNode.group && colDef.groupRowEditable != null) {
        if (beans.rowGroupingEditValueSvc?.isGroupCellEditable(rowNode, column)) {
            return true;
        }
        return existingEditing(beans, editPosition);
    }

    if (column.isColumnFunc(rowNode, editable)) {
        return true;
    }

    return existingEditing(beans, editPosition);
}

export function isFullRowCellEditable(
    beans: BeanCollection,
    position: Required<EditPosition>,
    source: 'api' | 'ui' = 'ui'
): boolean {
    const editable = isCellEditable(beans, position);
    if (editable || source === 'ui') {
        return editable;
    }

    // check if other cells in row are editable, so starting edit on uneditable cell will still work
    const { rowNode, column } = position;
    for (const col of beans.colModel.colsList) {
        if (col !== column && isCellEditable(beans, { rowNode, column: col })) {
            return true;
        }
    }

    return false;
}
