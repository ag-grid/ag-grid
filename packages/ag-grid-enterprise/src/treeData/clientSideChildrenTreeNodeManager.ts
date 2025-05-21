import type {
    ClientSideNodeManagerUpdateRowDataResult,
    IChangedRowNodes,
    IClientSideNodeManager,
    NamedBean,
    RefreshModelParams,
    RowDataTransaction,
    RowNode,
} from 'ag-grid-community';
import { AbstractClientSideNodeManager } from 'ag-grid-community';
import { ChangedPath, _error, _getRowIdCallback, _warn } from 'ag-grid-community';

import { makeFieldPathGetter } from './fieldAccess';
import type { DataFieldGetter } from './fieldAccess';
import type { TreeRow } from './treeRow';

export class ClientSideChildrenTreeNodeManager<TData>
    extends AbstractClientSideNodeManager<TData>
    implements IClientSideNodeManager<TData>, NamedBean
{
    beanName = 'csrmChildrenTreeNodeSvc' as const;

    private childrenGetter: DataFieldGetter<TData, TData[] | null | undefined> | null = null;

    public override destroy(): void {
        super.destroy();

        // Forcefully deallocate memory
        this.childrenGetter = null;
    }

    public override extractRowData(): TData[] | null | undefined {
        return this.rootNode?.childrenAfterGroup?.map(({ data }) => data!);
    }

    public override activate(rootNode: RowNode<TData>): void {
        const oldChildrenGetter = this.childrenGetter;
        const childrenField = this.gos.get('treeDataChildrenField') ?? null;
        if (!oldChildrenGetter || oldChildrenGetter.path !== childrenField) {
            this.childrenGetter = makeFieldPathGetter(childrenField);
        }

        super.activate(rootNode);
    }

    public override deactivate(): void {
        this.childrenGetter = null;
        super.deactivate();
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

    protected override loadNewRowData(rowData: TData[]): void {
        const rootNode = this.rootNode!;
        const childrenGetter = this.childrenGetter;

        const processedData = new Map<TData, TreeRow<TData>>();
        const allLeafChildren: TreeRow<TData>[] = [];

        rootNode.allLeafChildren = allLeafChildren;

        const processChild = (parent: RowNode, data: TData) => {
            let row = processedData.get(data);
            if (row !== undefined) {
                _error(2, { nodeId: row.id }); // Duplicate node
                return;
            }

            row = this.createRowNode(data, allLeafChildren.length);
            row.treeNode = parent;
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
    }

    public override setImmutableRowData(params: RefreshModelParams<TData>, rowData: TData[]): void {
        this.dispatchRowDataUpdateStartedEvent(rowData);

        const gos = this.gos;
        const rootNode = this.rootNode!;
        const childrenGetter = this.childrenGetter;
        const getRowIdFunc = _getRowIdCallback(gos)!;
        const canReorder = !gos.get('suppressMaintainUnsortedOrder');

        const processedData = new Map<TData, TreeRow<TData>>();

        const changedPath = new ChangedPath(false, rootNode);
        params.changedPath = changedPath;

        const changedRowNodes = params.changedRowNodes!;

        const oldAllLeafChildren: TreeRow[] | null = rootNode.allLeafChildren;
        const allLeafChildren: TreeRow[] = [];
        const nodesToUnselect: TreeRow<TData>[] = [];

        let orderChanged = false;
        let rowsChanged = false;

        const processChildren = (parent: TreeRow<TData>, children: TData[], childrenLevel: number): void => {
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

        const processChild = (parent: TreeRow<TData>, data: TData, level: number): number => {
            let row = processedData.get(data);
            if (row !== undefined) {
                _warn(2, { nodeId: row.id }); // Duplicate node
                return -1;
            }

            const id = getRowIdFunc({ data, level });

            row = this.getRowNode(id) as TreeRow<TData> | undefined;
            if (row) {
                let rowChanged = false;
                if (row.data !== data) {
                    rowChanged = true;
                    row.updateData(data);
                    if (!row.selectable && row.isSelected()) {
                        nodesToUnselect.push(row);
                    }
                }
                if (row.treeNode !== parent) {
                    row.treeNode = parent;
                    rowChanged = true;
                }
                if (rowChanged) {
                    rowsChanged = true;
                    changedRowNodes.update(row);
                }
            } else {
                row = this.createRowNode(data, -1);
                row.treeNode = parent;
                rowsChanged = true;
                changedRowNodes.add(row);
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
            const pinnedRowModel = this.beans.pinnedRowModel;
            for (let i = 0, len = oldAllLeafChildren.length; i < len; ++i) {
                const row = oldAllLeafChildren[i];
                if (!processedData.has(row.data)) {
                    row.treeNode = null;
                    row.treeNodeFlags = 0;
                    const pinnedSibling = row.pinnedSibling;
                    if (pinnedSibling) {
                        pinnedRowModel?.pinRow(pinnedSibling, null);
                    }
                    row.clearRowTopAndRowIndex();
                    this.rowNodeDeleted(row);
                    if (row.isSelected()) {
                        nodesToUnselect.push(row);
                    }
                    changedRowNodes.remove(row);
                }
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
                (row as TreeRow<TData>).sourceRowIndex = allLeafChildren.push(row) - 1;
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
