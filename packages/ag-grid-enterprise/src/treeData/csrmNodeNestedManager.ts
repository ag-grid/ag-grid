import type {
    ChangedRowNodes,
    ClientSideNodeManagerUpdateRowDataResult,
    GridOptions,
    RefreshModelParams,
    RowDataTransaction,
    RowNode,
} from 'ag-grid-community';
import { ClientSideNodeManager, _error, _getRowIdCallback, _warn } from 'ag-grid-community';

import type { DataFieldGetter } from './fieldAccess';
import { makeFieldPathGetter } from './fieldAccess';

export class CsrmNodeNestedManager<TData> extends ClientSideNodeManager<TData> {
    private childrenGetter: DataFieldGetter<TData, TData[] | null | undefined> | null | undefined = undefined;

    public override extractRowData(): TData[] | null | undefined {
        return super.extractRowData(this.rootNode.childrenAfterGroup ?? null);
    }

    public override onPropChange(changedProps: ReadonlySet<keyof GridOptions>): boolean {
        const gos = this.gos;
        if (changedProps.has('treeDataChildrenField')) {
            this.childrenGetter = undefined;
            if (gos.get('treeData')) {
                return true;
            }
        }
        if (changedProps.has('treeData') && gos.get('treeDataChildrenField')) {
            return true;
        }
        return super.onPropChange(changedProps);
    }

    private getChildrenGetter(): DataFieldGetter<TData, TData[] | null | undefined> | null | undefined {
        let result = this.childrenGetter;
        if (result === undefined) {
            this.childrenGetter = result = makeFieldPathGetter(this.gos.get('treeDataChildrenField') ?? null);
        }
        return result;
    }

    public override updateRowData(
        _rowDataTran: RowDataTransaction<TData>,
        changedRowNodes: ChangedRowNodes<TData>
    ): ClientSideNodeManagerUpdateRowDataResult<TData> {
        _warn(268); // transactions not supported with treeDataChildrenField
        return {
            changedRowNodes,
            rowNodeTransaction: { add: [], remove: [], update: [] },
            rowsInserted: false,
        };
    }

    protected override loadNewRowData(rowData: TData[]): RowNode[] {
        const rootNode = this.rootNode;
        const childrenGetter = this.getChildrenGetter();
        const processedData = new Map<TData, RowNode<TData>>();
        const allLeafChildren = new Array<RowNode<TData>>(rowData.length);

        let writeIdx = 0;
        const processChild = (parent: RowNode, data: TData) => {
            let row = processedData.get(data);
            if (row !== undefined) {
                _error(2, { nodeId: row.id }); // Duplicate node
                return;
            }

            row = this.createRowNode(data);
            row.treeParent = parent;
            row.sourceRowIndex = writeIdx;
            allLeafChildren[writeIdx++] = row;
            processedData.set(data, row);

            const children = childrenGetter?.(data);
            if (children) {
                for (let i = 0, len = children.length; i < len; ++i) {
                    processChild(row, children[i]);
                }
            }
        };

        for (let i = 0, len = rowData.length; i < len; ++i) {
            processChild(rootNode, rowData[i]);
        }
        allLeafChildren.length = writeIdx;
        return allLeafChildren;
    }

    public override setImmutableRowData(params: RefreshModelParams<TData>, rowData: TData[]): void {
        this.dispatchRowDataUpdateStartedEvent(rowData);
        const getRowIdFunc = _getRowIdCallback(this.gos)!;
        const reorder = !this.gos.get('suppressMaintainUnsortedOrder');
        const processedNodes = new Set<RowNode<TData>>();
        const rootNode = this.rootNode;
        const nodesToUnselect: RowNode<TData>[] = [];
        const changedRowNodes = params.changedRowNodes!;
        const { adds, updates } = changedRowNodes;
        const childrenGetter = this.getChildrenGetter();

        let nodesAdded = false;
        let dataUpdated = false;
        let nodesChanged = false;
        let prevSourceRowIndex = -1;

        const processChildren = (parent: RowNode<TData>, childrenData: TData[], level: number): void => {
            for (let i = 0, len = childrenData.length; i < len; ++i) {
                const data = childrenData[i];
                let node = this.getRowNode(getRowIdFunc({ data, level }));
                if (node) {
                    if (!nodesChanged && reorder) {
                        const sourceRowIndex = node.sourceRowIndex;
                        nodesChanged =
                            nodesAdded || // A node was inserted not at the end
                            sourceRowIndex <= prevSourceRowIndex; // A node was moved up, so order changed
                        prevSourceRowIndex = sourceRowIndex;
                    }
                    if (node.data !== data) {
                        dataUpdated = true;
                        node.updateData(data);
                        if (!adds.has(node)) {
                            updates.add(node);
                            if (!node.selectable && node.isSelected()) {
                                nodesToUnselect.push(node);
                            }
                        }
                    }
                    dataUpdated ||= node.treeParent !== parent;
                } else {
                    node = this.createRowNode(data);
                    adds.add(node);
                    nodesAdded = true;
                }
                node.treeParent = parent;
                processedNodes.add(node);

                const children = childrenGetter?.(data);
                if (children) {
                    processChildren(node, children, level + 1);
                }
            }
        };

        processChildren(rootNode, rowData, 0);

        nodesChanged ||= nodesAdded;

        // Destroy the remaining unprocessed node and collect the removed that were selected.
        if (this.removeUnprocessed(rootNode.allLeafChildren!, processedNodes, nodesToUnselect, changedRowNodes)) {
            nodesChanged = true;
        }

        if (nodesChanged && this.updateLeafs(rootNode, processedNodes, reorder, changedRowNodes)) {
            params.rowNodesOrderChanged = true;
        }

        if (nodesChanged || dataUpdated) {
            params.rowDataUpdated = true;
            this.deselect(nodesToUnselect);
        }
    }
}
