// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from '../entities/rowNode';
/**
 * Gets called by: a) ClientSideNodeManager and b) GroupStage to do sorting.
 * when in ClientSideNodeManager we always have indexes (as this sorts the items the
 * user provided) but when in GroupStage, the nodes can contain filler nodes that
 * don't have order id's
 * @param {RowNode[]} rowNodes
 * @param {Object} rowNodeOrder
 */
export declare function sortRowNodesByOrder(rowNodes: RowNode[], rowNodeOrder: {
    [id: string]: number;
}): void;
export declare function traverseNodesWithKey(nodes: RowNode[] | null, callback: (node: RowNode, key: string) => void): void;
