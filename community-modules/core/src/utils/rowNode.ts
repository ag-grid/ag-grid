import type { RowNode } from '../entities/rowNode';

/**
 * Gets called by: a) ClientSideNodeManager and b) GroupStage to do sorting.
 * when in ClientSideNodeManager we always have indexes (as this sorts the items the
 * user provided) but when in GroupStage, the nodes can contain filler nodes that
 * don't have order id's
 * @param {RowNode[]} rowNodes
 * @param {Object} rowNodeOrder
 *
 * @returns a boolean representing whether nodes were reordered
 */
export function _sortRowNodesByOrder(
    rowNodes: RowNode[] | null | undefined,
    rowNodeOrder: { [id: string]: number }
): boolean {
    if (!rowNodes) {
        return false;
    }

    const comparator = (nodeA: RowNode, nodeB: RowNode) => {
        const positionA = rowNodeOrder[nodeA.id!];
        const positionB = rowNodeOrder[nodeB.id!];

        const aHasIndex = positionA !== undefined;
        const bHasIndex = positionB !== undefined;

        const bothNodesAreUserNodes = aHasIndex && bHasIndex;
        const bothNodesAreFillerNodes = !aHasIndex && !bHasIndex;

        if (bothNodesAreUserNodes) {
            // when comparing two nodes the user has provided, they always
            // have indexes
            return positionA - positionB;
        }

        if (bothNodesAreFillerNodes) {
            // when comparing two filler nodes, we have no index to compare them
            // against, however we want this sorting to be deterministic, so that
            // the rows don't jump around as the user does delta updates. so we
            // want the same sort result. so we use the __objectId - which doesn't make sense
            // from a sorting point of view, but does give consistent behaviour between
            // calls. otherwise groups jump around as delta updates are done.
            // note: previously here we used nodeId, however this gave a strange order
            // as string ordering of numbers is wrong, so using id based on creation order
            // as least gives better looking order.
            return nodeA.__objectId - nodeB.__objectId;
        }

        if (aHasIndex) {
            return 1;
        }

        return -1;
    };

    // check if the list first needs sorting
    let rowNodeA: RowNode;
    let rowNodeB: RowNode;
    let atLeastOneOutOfOrder = false;

    for (let i = 0; i < rowNodes.length - 1; i++) {
        rowNodeA = rowNodes[i];
        rowNodeB = rowNodes[i + 1];

        if (comparator(rowNodeA, rowNodeB) > 0) {
            atLeastOneOutOfOrder = true;
            break;
        }
    }

    if (atLeastOneOutOfOrder) {
        rowNodes.sort(comparator);
        return true;
    }
    return false;
}

export function _sortRowNodesByPositionInRootChildren(rowNodes: RowNode[] | null | undefined): boolean {
    if (!rowNodes) {
        return false;
    }
    const length = rowNodes.length;
    if (length < 2) {
        return false;
    }

    let atLeastOneOutOfOrder = false;
    for (let i = 1; i < length; i++) {
        if (compareByPositionInRootChildren(rowNodes[i - 1], rowNodes[i]) > 0) {
            atLeastOneOutOfOrder = true;
            break;
        }
    }

    if (!atLeastOneOutOfOrder) {
        return false;
    }

    rowNodes.sort(compareByPositionInRootChildren);
    return true;
}

function compareByPositionInRootChildren(nodeA: RowNode, nodeB: RowNode): number {
    const positionA = nodeA.positionInRootChildren;
    const positionB = nodeB.positionInRootChildren;

    const aHasIndex = positionA >= 0;
    const bHasIndex = positionB >= 0;

    const bothNodesAreUserNodes = aHasIndex && bHasIndex;
    const bothNodesAreFillerNodes = !aHasIndex && !bHasIndex;

    if (bothNodesAreUserNodes) {
        // when comparing two nodes the user has provided, they always
        // have indexes
        return positionA - positionB;
    }

    if (bothNodesAreFillerNodes) {
        // when comparing two filler nodes, we have no index to compare them
        // against, however we want this sorting to be deterministic, so that
        // the rows don't jump around as the user does delta updates. so we
        // want the same sort result. so we use the __objectId - which doesn't make sense
        // from a sorting point of view, but does give consistent behaviour between
        // calls. otherwise groups jump around as delta updates are done.
        // note: previously here we used nodeId, however this gave a strange order
        // as string ordering of numbers is wrong, so using id based on creation order
        // as least gives better looking order.
        return nodeA.__objectId - nodeB.__objectId;
    }

    if (aHasIndex) {
        return 1;
    }

    return -1;
}
