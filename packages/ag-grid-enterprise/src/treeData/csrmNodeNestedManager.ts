import type {
    ClientSideNodeManagerUpdateRowDataResult,
    GridOptions,
    IChangedRowNodes,
    RefreshModelParams,
    RowDataTransaction,
    RowNode,
} from 'ag-grid-community';
import { ChangedPath, ClientSideNodeManager, _error, _getRowIdCallback, _warn } from 'ag-grid-community';

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
        return false;
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
        changedRowNodes: IChangedRowNodes<TData>
    ): ClientSideNodeManagerUpdateRowDataResult<TData> {
        _warn(268);
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
        const allLeafChildren: RowNode<TData>[] = [];

        const processChild = (parent: RowNode, data: TData) => {
            let row = processedData.get(data);
            if (row !== undefined) {
                _error(2, { nodeId: row.id }); // Duplicate node
                return;
            }

            row = this.createRowNode(data);
            row.treeParent = parent;
            row.sourceRowIndex = allLeafChildren.length;
            processedData.set(data, row);
            allLeafChildren.push(row);

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

        return allLeafChildren;
    }

    public override setImmutableRowData(params: RefreshModelParams<TData>, rowData: TData[]): void {
        this.dispatchRowDataUpdateStartedEvent(rowData);

        const gos = this.gos;
        const rootNode = this.rootNode;
        const childrenGetter = this.getChildrenGetter();
        const getRowIdFunc = _getRowIdCallback(gos)!;
        const canReorder = !gos.get('suppressMaintainUnsortedOrder');

        const processedData = new Map<TData, RowNode<TData>>();

        const changedPath = new ChangedPath(false, rootNode);
        params.changedPath = changedPath;

        const changedRowNodes = params.changedRowNodes!;

        const oldAllLeafChildren: RowNode[] | null = rootNode.allLeafChildren;
        const allLeafChildren: RowNode[] = [];
        const nodesToUnselect: RowNode<TData>[] = [];

        let orderChanged = false;
        let rowsChanged = false;
        const { adds, updates } = changedRowNodes;

        const processChildren = (parent: RowNode<TData>, children: TData[], childrenLevel: number): void => {
            const childrenLen = children?.length;
            let inOrder = true;
            let prevIndex = -1;
            for (let i = 0; i < childrenLen; ++i) {
                const oldSourceRowIndex = processChild(parent, children[i], childrenLevel);
                if (canReorder && oldSourceRowIndex >= 0) {
                    if (oldSourceRowIndex < prevIndex) {
                        inOrder = false;
                    }
                    prevIndex = oldSourceRowIndex;
                }
            }
            if (!inOrder) {
                orderChanged = true;
            }
        };

        const processChild = (parent: RowNode<TData>, data: TData, level: number): number => {
            let row = processedData.get(data);
            if (row !== undefined) {
                _warn(2, { nodeId: row.id }); // Duplicate node
                return -1;
            }

            const id = getRowIdFunc({ data, level });

            row = this.getRowNode(id);
            if (row) {
                let rowChanged = false;
                if (row.data !== data) {
                    rowChanged = true;
                    row.updateData(data);
                    if (!row.selectable && row.isSelected()) {
                        nodesToUnselect.push(row);
                    }
                }
                if (row.treeParent !== parent) {
                    row.treeParent = parent;
                    rowChanged = true;
                }
                if (rowChanged) {
                    rowsChanged = true;
                    if (!adds.has(row)) {
                        updates.add(row);
                    }
                }
            } else {
                row = this.createRowNode(data);
                row.treeParent = parent;
                rowsChanged = true;
                adds.add(row);
            }

            processedData.set(data, row);

            let oldSourceRowIndex: number;
            if (canReorder) {
                oldSourceRowIndex = row.sourceRowIndex;
                row.sourceRowIndex = allLeafChildren.push(row) - 1;
            } else {
                oldSourceRowIndex = -1;
            }

            const children = childrenGetter?.(data);
            if (children) {
                processChildren(row, children, level + 1);
            }

            return oldSourceRowIndex;
        };

        processChildren(rootNode, rowData, 0);

        if (oldAllLeafChildren) {
            for (let i = 0, len = oldAllLeafChildren.length; i < len; ++i) {
                const row = oldAllLeafChildren[i];
                if (processedData.has(row.data)) {
                    continue;
                }
                this.rowNodeDeleted(row);
                if (row.isSelected()) {
                    nodesToUnselect.push(row);
                }
                changedRowNodes.remove(row);
            }
        }

        if (!canReorder) {
            // First append all the old children that weren't removed
            if (oldAllLeafChildren) {
                const removals = changedRowNodes.removals;
                for (let i = 0, len = oldAllLeafChildren.length; i < len; ++i) {
                    const row = oldAllLeafChildren[i];
                    if (!removals.has(row)) {
                        row.sourceRowIndex = allLeafChildren.push(row) - 1;
                    }
                }
            }

            // Now append all the new children
            for (const row of changedRowNodes.adds) {
                row.sourceRowIndex = allLeafChildren.push(row) - 1;
            }
        }

        rootNode.allLeafChildren = allLeafChildren;

        if (nodesToUnselect.length) {
            this.deselectNodes(nodesToUnselect);
        }

        const sibling = rootNode.sibling;
        if (sibling) {
            sibling.allLeafChildren = allLeafChildren;
        }

        if (rowsChanged || orderChanged) {
            params.rowDataUpdated = true;
            params.rowNodesOrderChanged ||= orderChanged;
        }
    }
}
