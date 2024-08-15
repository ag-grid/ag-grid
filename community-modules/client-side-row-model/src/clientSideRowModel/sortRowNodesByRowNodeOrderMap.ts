import type { RowNode } from '@ag-grid-community/core';

/**
 * Gets called by ClientSideNodeManager only.
 * It expects all id's to be in the rowNodeOrder map.
 * @returns a boolean representing whether nodes were reordered
 */
export function sortRowNodesByRowNodeOrderMap(
    rowNodes: RowNode[] | null | undefined,
    rowNodeOrder: { [id: string]: number }
): boolean {
    if (!rowNodes) {
        return false;
    }

    // check if the list first needs sorting
    let atLeastOneOutOfOrder = false;

    let prevOrder = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < rowNodes.length; i++) {
        const node = rowNodes[i];
        const order = rowNodeOrder[node.id!];
        if (order <= prevOrder) {
            atLeastOneOutOfOrder = true;
            break;
        }
        prevOrder = order;
    }

    if (atLeastOneOutOfOrder) {
        const compareRowNodeOrder = (nodeA: RowNode, nodeB: RowNode) =>
            rowNodeOrder[nodeA.id!] - rowNodeOrder[nodeB.id!];

        rowNodes.sort(compareRowNodeOrder);
        return true;
    }

    return false;
}
