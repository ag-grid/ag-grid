import type { BeanCollection } from '../context/context';
import type { AgEventType } from '../eventTypes';
import type { RowEvent } from '../events';
import type { GridOptionsService } from '../gridOptionsService';
import { IGNORED_SIBLING_PROPERTIES, RowNode } from './rowNode';

export function _createRowNodeFooter(rowNode: RowNode, beans: BeanCollection): void {
    // only create footer node once, otherwise we have daemons and
    // the animate screws up with the daemons hanging around
    if (rowNode.sibling) {
        return;
    }

    const footerNode = new RowNode(beans);

    Object.keys(rowNode).forEach((key: keyof RowNode) => {
        if (IGNORED_SIBLING_PROPERTIES.has(key)) {
            return;
        }
        (footerNode as any)[key] = (rowNode as any)[key];
    });

    footerNode.footer = true;
    footerNode.setRowTop(null);
    footerNode.setRowIndex(null);

    // manually set oldRowTop to null so we discard any
    // previous information about its position.
    footerNode.oldRowTop = null;

    footerNode.id = 'rowGroupFooter_' + rowNode.id;

    // get both header and footer to reference each other as siblings. this is never undone,
    // only overwritten. so if a group is expanded, then contracted, it will have a ghost
    // sibling - but that's fine, as we can ignore this if the header is contracted.
    footerNode.sibling = rowNode;
    rowNode.sibling = footerNode;
}

export function _destroyRowNodeFooter(rowNode: RowNode): void {
    if (!rowNode.sibling) {
        return;
    }

    rowNode.sibling.setRowTop(null);
    rowNode.sibling.setRowIndex(null);

    rowNode.sibling = undefined as any;
}

export function _createGlobalRowEvent<T extends AgEventType>(
    rowNode: RowNode,
    gos: GridOptionsService,
    type: T
): RowEvent<T> {
    return gos.addGridCommonParams({
        type,
        node: rowNode,
        data: rowNode.data,
        rowIndex: rowNode.rowIndex,
        rowPinned: rowNode.rowPinned,
    });
}
