import type { RowNode } from '@ag-grid-community/core';

const isAtLeastOneNodeOutOfOrder = (rowNodes: RowNode[], rowNodeOrder: { readonly [id: string]: number }): boolean => {
    let lastOrder = -1;
    for (let i = 0; i < rowNodes.length; i++) {
        const rowNode = rowNodes[i];
        const order = rowNodeOrder[rowNode.id!];
        if (order < lastOrder) {
            return true;
        }
        lastOrder = order;
    }
    return false;
};

/**
 * Gets called by ClientSideNodeManager.
 * It expects all id's to be in the rowNodeOrder map.
 * @returns a boolean representing whether nodes were reordered
 */
export function sortRowNodesByRowNodeOrderMap(
    rowNodes: RowNode[] | null | undefined,
    rowNodeOrder: { readonly [id: string]: number }
): boolean {
    if (!rowNodes) {
        return false;
    }

    if (!isAtLeastOneNodeOutOfOrder(rowNodes, rowNodeOrder)) {
        return false;
    }

    const rowNodeOrderComparer = (nodeA: RowNode, nodeB: RowNode) => rowNodeOrder[nodeA.id!] - rowNodeOrder[nodeB.id!];
    rowNodes.sort(rowNodeOrderComparer);
    return true;
}
