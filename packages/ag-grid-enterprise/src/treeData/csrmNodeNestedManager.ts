import type {
    ChangedRowNodes,
    ClientSideNodeManagerUpdateRowDataResult,
    GridOptions,
    RefreshModelParams,
    RowDataTransaction,
    RowNode,
} from 'ag-grid-community';
import { ClientSideNodeManager, _fieldGetter, _getRowIdCallback, _warn } from 'ag-grid-community';

type NestedDataGetter<TData> = (data: TData | null | undefined) => TData[] | null | undefined;

export class CsrmNodeNestedManager<TData> extends ClientSideNodeManager<TData> {
    private nestedDataGetter: NestedDataGetter<TData> | null | undefined = undefined;

    public override extractRowData(): TData[] | null | undefined {
        return super.extractRowData(this.rootNode.childrenAfterGroup ?? null);
    }

    public override onPropChange(changedProps: ReadonlySet<keyof GridOptions>): boolean {
        const gos = this.gos;
        if (changedProps.has('treeDataChildrenField')) {
            this.nestedDataGetter = undefined;
            if (gos.get('treeData')) {
                return true;
            }
        }
        if (changedProps.has('treeData') && gos.get('treeDataChildrenField')) {
            return true;
        }
        return super.onPropChange(changedProps);
    }

    private getNestedDataGetter(): NestedDataGetter<TData> | null {
        let getter = this.nestedDataGetter;
        if (getter === undefined) {
            const field = this.gos.get('treeDataChildrenField');
            this.nestedDataGetter = getter = field ? _fieldGetter(field) : null;
        }
        return getter;
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
        const nestedDataGetter = this.getNestedDataGetter();
        const allLeafs = new Array<RowNode<TData>>(rowData.length);

        let writeIdx = 0;
        const processChildren = (parent: RowNode, childrenData: TData[]) => {
            for (let i = 0, len = childrenData.length; i < len; ++i) {
                const data = childrenData[i];
                const node = this.createRowNode(data);
                node.sourceRowIndex = writeIdx;
                allLeafs[writeIdx++] = node;
                if (nestedDataGetter) {
                    node.treeParent = parent;
                    const children = nestedDataGetter(data);
                    if (children) {
                        processChildren(node, children);
                    }
                }
            }
        };

        processChildren(this.rootNode, rowData);
        allLeafs.length = writeIdx;
        return allLeafs;
    }

    public override setImmutableRowData(params: RefreshModelParams<TData>, rowData: TData[]): void {
        this.dispatchRowDataUpdateStartedEvent(rowData);
        const getRowIdFunc = _getRowIdCallback(this.gos)!;
        const nestedDataGetter = this.getNestedDataGetter();
        const reorder = !this.gos.get('suppressMaintainUnsortedOrder');
        const changedRowNodes = params.changedRowNodes!;
        const { adds, updates } = changedRowNodes;
        const processedNodes = new Set<RowNode<TData>>();
        const nodesToUnselect: RowNode<TData>[] = [];

        let added = false;
        let updated = false;
        let reordered = false;
        let prevIndex = -1;

        const processChildren = (parent: RowNode<TData>, childrenData: TData[], level: number): void => {
            for (let i = 0, len = childrenData.length; i < len; ++i) {
                const data = childrenData[i];
                let node = this.getRowNode(getRowIdFunc({ data, level }));
                if (node) {
                    if (!reordered && reorder) {
                        const oldIndex = node.sourceRowIndex;
                        reordered =
                            added || // There was an update after an insertion, so order changed
                            oldIndex <= prevIndex; // A node was moved up, so order changed
                        prevIndex = oldIndex;
                    }
                    if (node.data !== data) {
                        updated = true;
                        node.updateData(data);
                        if (!adds.has(node)) {
                            updates.add(node);
                        }
                        if (!node.selectable && node.isSelected()) {
                            nodesToUnselect.push(node);
                        }
                    }
                    updated ||= !!nestedDataGetter && node.treeParent !== parent;
                } else {
                    added = true;
                    node = this.createRowNode(data);
                    adds.add(node);
                }
                processedNodes.add(node);

                if (nestedDataGetter) {
                    node.treeParent = parent;
                    const children = nestedDataGetter(data);
                    if (children) {
                        processChildren(node, children, level + 1);
                    }
                }
            }
        };

        const rootNode = this.rootNode;
        processChildren(rootNode, rowData, 0);

        // Destroy the remaining unprocessed node and collect the removed that were selected.
        if (this.removeUnprocessed(rootNode.allLeafChildren!, processedNodes, nodesToUnselect, changedRowNodes)) {
            reordered = true;
        }

        if ((added || reordered) && this.updateLeafs(rootNode, processedNodes, reorder, changedRowNodes)) {
            params.rowNodesOrderChanged = true;
        }
        if (added || updated || reordered) {
            params.rowDataUpdated = true;
            this.deselect(nodesToUnselect);
        }
    }
}
