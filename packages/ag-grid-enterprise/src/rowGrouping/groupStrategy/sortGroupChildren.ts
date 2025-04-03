import type { RowNode } from 'ag-grid-community';

export function sortGroupChildren(rowNodes: RowNode[] | null | undefined): boolean {
    if (!rowNodes) {
        return false;
    }
    const length = rowNodes.length;
    if (length < 2) {
        return false;
    }

    let atLeastOneOutOfOrder = false;
    for (let i = 1; i < length; i++) {
        if (compareGroupChildren(rowNodes[i - 1], rowNodes[i]) > 0) {
            atLeastOneOutOfOrder = true;
            break;
        }
    }

    if (!atLeastOneOutOfOrder) {
        return false;
    }

    rowNodes.sort(compareGroupChildren);
    return true;
}

function compareGroupChildren(nodeA: RowNode, nodeB: RowNode): number {
    const positionA = nodeA.sourceRowIndex;
    const positionB = nodeB.sourceRowIndex;

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
