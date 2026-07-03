import type { RowNode } from 'ag-grid-community';

import { optionalEscapeString } from '../../string-utils';
import type { GridRows } from '../gridRows';

/** Resolves the best available children array for a row node. */
export function getRowChildren(row: RowNode): RowNode[] | null {
    return row.childrenAfterSort ?? row.childrenAfterAggFilter ?? row.childrenAfterFilter ?? row.childrenAfterGroup;
}

/** Determines the display type label for a row node. */
export function getNodeType(gridRows: GridRows, row: RowNode): string {
    if (row.level === -1 && row === gridRows.rootRowNode) {
        return 'ROOT';
    }
    if (row.footer) {
        return 'footer';
    }
    const values: string[] = [];
    if (row.master) {
        values.push('master');
    }
    if (row.detail) {
        values.push('detail');
    } else if (row.group && !row.data) {
        values.push(row.leafGroup ? 'LEAF_GROUP' : 'filler');
    } else if (row.group || row.childrenAfterGroup?.length || row.hasChildren()) {
        values.push('GROUP');
    }
    if (row.leafGroup && !values.includes('LEAF_GROUP')) {
        values.push('leafGroup');
    }
    if (values.length > 0) {
        return values.join('-');
    }
    return row.data ? 'LEAF' : 'filler';
}

/** Builds the row type prefix string for diagram output. */
export function getRowTypePrefix(gridRows: GridRows, row: RowNode): string {
    const rowPinned = row.rowPinned;
    if (rowPinned === 'top') {
        return 'PINNED_TOP';
    }
    if (rowPinned === 'bottom') {
        return 'PINNED_BOTTOM';
    }
    if (
        gridRows.treeData &&
        row.key &&
        !row.footer &&
        (row.data || (typeof row.id === 'string' && row.id.startsWith('row-group-')))
    ) {
        return optionalEscapeString(row.key) + ' ' + getNodeType(gridRows, row);
    }
    return getNodeType(gridRows, row);
}

/** Builds the row state flags string (selected, collapsed, hidden, editing, batch). */
export function getRowStateFlags(gridRows: GridRows, row: RowNode): string {
    if (row.rowPinned) {
        return '';
    }
    let result = '';
    const selectionState = row.isSelected();
    if (selectionState) {
        result += ' selected';
    } else if (selectionState === undefined) {
        result += ' indeterminate';
    }
    // detail rows are structurally non-selectable and already labelled 'detail', so don't flag them
    if (!row.selectable && !row.detail) {
        result += ' 🚫';
    }
    if (row.level >= 0 && !row.expanded && (row.group || row.master || row.isExpandable())) {
        result += ' collapsed';
    }
    if (!gridRows.isRowDisplayed(row) && row !== gridRows.rootRowNode) {
        result += ' hidden';
    }
    if (gridRows.checkEditState && gridRows.isRowEditing(row)) {
        if (gridRows.isRowActivelyEditing(row)) {
            result += ' 🖍️';
        }
        if (gridRows.isRowBatchPending(row)) {
            result += ' ⏳';
        }
    }
    return result;
}
