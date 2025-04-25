import type { BeanCollection, RowNode } from 'ag-grid-community';
import { _createRowNodeSibling } from 'ag-grid-community';

export function _createRowNodeFooter(rowNode: RowNode, beans: BeanCollection): void {
    // only create footer node once, otherwise we have daemons and
    // the animate screws up with the daemons hanging around
    if (rowNode.sibling) {
        return;
    }

    const footerNode = _createRowNodeSibling(rowNode, beans);

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
