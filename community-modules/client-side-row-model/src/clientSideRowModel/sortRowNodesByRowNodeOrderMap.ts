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

    let prevPosition = -1;
    for (let i = 0; i < rowNodes.length; i++) {
        const node = rowNodes[i];
        const nodePosition = rowNodeOrder[node.id!];
        if (prevPosition > nodePosition) {
            atLeastOneOutOfOrder = true;
            break;
        }
        prevPosition = nodePosition;
    }

    if (atLeastOneOutOfOrder) {
        const compareRowNodeOrder = (nodeA: RowNode, nodeB: RowNode) =>
            rowNodeOrder[nodeA.id!] - rowNodeOrder[nodeB.id!];

        rowNodes.sort(compareRowNodeOrder);
        return true;
    }

    return false;
}

export function sortRowNodesByRootIndex(rowNodes: RowNode[] | null | undefined): void {
    if (!rowNodes?.length) {
        return;
    }

    rowNodes.sort((nodeA: RowNode, nodeB: RowNode) => nodeA.positionInRootChildren - nodeB.positionInRootChildren);
}
