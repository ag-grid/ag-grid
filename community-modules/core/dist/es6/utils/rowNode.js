/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
/**
 * Gets called by: a) ClientSideNodeManager and b) GroupStage to do sorting.
 * when in ClientSideNodeManager we always have indexes (as this sorts the items the
 * user provided) but when in GroupStage, the nodes can contain filler nodes that
 * don't have order id's
 * @param {RowNode[]} rowNodes
 * @param {Object} rowNodeOrder
 */
export function sortRowNodesByOrder(rowNodes, rowNodeOrder) {
    if (!rowNodes) {
        return;
    }
    var comparator = function (nodeA, nodeB) {
        var positionA = rowNodeOrder[nodeA.id];
        var positionB = rowNodeOrder[nodeB.id];
        var aHasIndex = positionA !== undefined;
        var bHasIndex = positionB !== undefined;
        var bothNodesAreUserNodes = aHasIndex && bHasIndex;
        var bothNodesAreFillerNodes = !aHasIndex && !bHasIndex;
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
    var rowNodeA;
    var rowNodeB;
    var atLeastOneOutOfOrder = false;
    for (var i = 0; i < rowNodes.length - 1; i++) {
        rowNodeA = rowNodes[i];
        rowNodeB = rowNodes[i + 1];
        if (comparator(rowNodeA, rowNodeB) > 0) {
            atLeastOneOutOfOrder = true;
            break;
        }
    }
    if (atLeastOneOutOfOrder) {
        rowNodes.sort(comparator);
    }
}
export function traverseNodesWithKey(nodes, callback) {
    var keyParts = [];
    recursiveSearchNodes(nodes);
    function recursiveSearchNodes(currentNodes) {
        if (!currentNodes) {
            return;
        }
        currentNodes.forEach(function (node) {
            // also checking for children for tree data
            if (node.group || node.hasChildren()) {
                keyParts.push(node.key);
                var key = keyParts.join('|');
                callback(node, key);
                recursiveSearchNodes(node.childrenAfterGroup);
                keyParts.pop();
            }
        });
    }
}
