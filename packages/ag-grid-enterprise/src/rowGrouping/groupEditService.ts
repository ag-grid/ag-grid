import type {
    AgColumn,
    CellValueChangedEvent,
    IClientSideRowModel,
    IGroupEditService,
    IRowNode,
    RowNode,
    _RowsDrop,
} from 'ag-grid-community';
import {
    BeanStub,
    ChangedPath,
    _ChangedRowNodes,
    _firstLeaf,
    _getCellByPosition,
    _isClientSideRowModel,
    _reorderAllLeafs,
} from 'ag-grid-community';

export class GroupEditService extends BeanStub implements IGroupEditService {
    public beanName = 'groupEditSvc' as const;
    private pendingGroupRefreshRows: Set<RowNode> | null = null;

    public postConstruct(): void {
        this.addManagedListeners(this.eventSvc, {
            batchEditingStopped: () => this.flushPendingGroupRefreshRows(),
            cellValueChanged: (event) => this.onCellValueChanged(event as CellValueChangedEvent),
        });
    }

    public wouldCycle(row: IRowNode, newParent: IRowNode | null | undefined): boolean {
        if (!newParent || row.parent === newParent) {
            return false;
        }
        let parent: IRowNode | null | undefined = newParent;
        while (parent) {
            if (parent === row) {
                return true;
            }
            parent = parent.parent;
        }
        return false;
    }

    public shouldHandleManagedRowMove<TData = any, TContext = any>(rowsDrop: _RowsDrop<TData, TContext>): boolean {
        if (!rowsDrop.rowDragManaged || !rowsDrop.sameGrid) {
            return false;
        }
        if (!this.gos.get('refreshAfterGroupEdit')) {
            return false;
        }
        return !!this.beans.rowGroupColsSvc?.columns?.length;
    }

    public canSetParent<TData = any, TContext = any>(rowsDrop: _RowsDrop<TData, TContext>): boolean {
        if (!rowsDrop.sameGrid) {
            return false;
        }
        if (this.beans.groupStage?.treeData) {
            return true;
        }
        if (!rowsDrop.rowDragManaged) {
            return false;
        }
        if (!this.gos.get('refreshAfterGroupEdit')) {
            return false;
        }
        return !!this.beans.rowGroupColsSvc?.columns?.length;
    }

    public moveRowsWithGroupEdit<TData = any, TContext = any>(rowsDrop: _RowsDrop<TData, TContext>): boolean {
        const groupColumns = this.beans.rowGroupColsSvc?.columns ?? [];
        if (!groupColumns.length) {
            return false;
        }

        const position = rowsDrop.position;
        const target = (rowsDrop.target as RowNode | null | undefined) ?? null;
        const rootNode = rowsDrop.rootNode as RowNode | null;
        const parentForValues = (rowsDrop.newParent as RowNode | null) ?? target?.parent ?? rootNode;
        const { values: groupValues, maxLevel } = this.buildGroupValuesFromParent(parentForValues, groupColumns);

        const focusSvc = this.beans.focusSvc;
        const cellPosition = focusSvc.getFocusedCell();
        const cellCtrl = cellPosition && _getCellByPosition(this.beans, cellPosition);

        const leafs = new Set<RowNode>();
        let dataChanged = false;

        for (const row of rowsDrop.rows as RowNode[]) {
            const leafRow = this.getLeafRow(row);
            if (!leafRow) {
                continue;
            }
            leafs.add(leafRow);
            if (this.updateRowGroupValues(leafRow, groupColumns, groupValues, maxLevel)) {
                dataChanged = true;
            }
        }

        const reorderPosition = position === 'inside' ? 'above' : position;
        const reorderTarget =
            position === 'inside' ? this.findFirstLeafForParent(parentForValues, leafs) ?? target : target;
        let orderChanged = false;
        if (leafs.size && reorderPosition !== 'none') {
            orderChanged = _reorderAllLeafs(
                (rootNode as RowNode)._leafs,
                leafs,
                reorderTarget,
                reorderPosition === 'above'
            );
        }

        if (!dataChanged && !orderChanged) {
            return false;
        }

        const rowModel = this.beans.rowModel as IClientSideRowModel;
        const changedRowNodes = new _ChangedRowNodes();
        changedRowNodes.reordered = orderChanged;
        for (const leaf of leafs) {
            changedRowNodes.updates.add(leaf);
        }
        rowModel.refreshModel({
            step: 'group',
            keepRenderedRows: true,
            animate: !this.gos.get('suppressAnimationFrame'),
            changedPath: rootNode ? new ChangedPath(false, rootNode) : undefined,
            changedRowNodes,
        });

        if (cellCtrl) {
            cellCtrl.focusCell();
        } else {
            focusSvc.clearFocusedCell();
        }

        return true;
    }

    private flushPendingGroupRefreshRows(): void {
        if (!this.pendingGroupRefreshRows?.size) {
            return;
        }
        const rows = Array.from(this.pendingGroupRefreshRows);
        this.pendingGroupRefreshRows = null;
        this.refreshGroupingForRows(rows);
    }

    private refreshGroupingForRows(rows: RowNode[]): void {
        if (!rows.length) {
            return;
        }

        const rowModel = this.beans.rowModel as IClientSideRowModel | undefined;
        if (!rowModel?.refreshModel) {
            return;
        }

        const changedRowNodes = new _ChangedRowNodes();
        changedRowNodes.reordered = true;
        for (const row of rows) {
            changedRowNodes.updates.add(row);
        }

        const rootNode = rowModel.rootNode as RowNode | null;
        rowModel.refreshModel({
            step: 'group',
            keepRenderedRows: true,
            animate: !this.gos.get('suppressAnimationFrame'),
            changedPath: rootNode ? new ChangedPath(false, rootNode) : undefined,
            changedRowNodes,
        });
    }

    private buildGroupValuesFromParent(
        parent: IRowNode | null,
        groupColumns: AgColumn[]
    ): {
        values: any[];
        maxLevel: number;
    } {
        const values = new Array<any>(groupColumns.length);
        let maxLevel = -1;
        let current: IRowNode | null | undefined = parent;
        while (current && current.level >= 0) {
            const column: AgColumn | undefined = groupColumns[current.level];
            if (column) {
                const colId = column.getColId();
                values[current.level] = current.groupData?.[colId] ?? current.key ?? undefined;
                if (current.level > maxLevel) {
                    maxLevel = current.level;
                }
            }
            current = current.parent;
        }
        return { values, maxLevel };
    }

    private updateRowGroupValues(
        row: RowNode,
        groupColumns: AgColumn[],
        groupValues: any[],
        maxLevel: number
    ): boolean {
        const { valueSvc } = this.beans;
        if (maxLevel < 0) {
            return false;
        }
        let changed = false;
        for (let level = 0; level < groupColumns.length; ++level) {
            const column = groupColumns[level];
            if (!column || level > maxLevel) {
                continue;
            }
            const newValue = groupValues[level];
            const currentValue = valueSvc.getValue(column, row, false, 'api');
            if (this.valuesAreEqual(currentValue, newValue)) {
                continue;
            }
            if (this.setRowGroupValue(row, column, newValue)) {
                changed = true;
            }
        }
        return changed;
    }

    private setRowGroupValue(row: RowNode, column: AgColumn, newValue: any): boolean {
        const editSvc = this.beans.editSvc;
        const result = editSvc?.setDataValue({ rowNode: row, column }, newValue, 'rowDrag');
        if (result != null) {
            return !!result;
        }
        return row.setDataValue(column, newValue, 'rowDrag');
    }

    private findFirstLeafForParent(parent: IRowNode | null, exclude: ReadonlySet<RowNode>): RowNode | null {
        const children = parent?.childrenAfterGroup;
        if (!children) {
            return null;
        }
        for (const child of children) {
            const leaf = this.getLeafRow(child);
            if (leaf && !exclude.has(leaf)) {
                return leaf;
            }
        }
        return null;
    }

    private valuesAreEqual(a: any, b: any): boolean {
        return a === b || (a == null && b == null);
    }

    private getLeafRow(row: IRowNode): RowNode | undefined {
        return row.data ? (row as RowNode) : _firstLeaf(row.childrenAfterGroup);
    }

    private onCellValueChanged(event: CellValueChangedEvent): void {
        const { column, node, source } = event;
        if (!column) {
            return;
        }
        if (!this.gos.get('refreshAfterGroupEdit')) {
            return;
        }

        if (source === 'rowDrag') {
            return;
        }

        if (!column.isRowGroupActive?.()) {
            return;
        }

        if (!_isClientSideRowModel(this.gos)) {
            return;
        }

        if (node.group || !node.data) {
            return;
        }

        const editSvc = this.beans.editSvc;
        if (editSvc?.isBatchEditing()) {
            const pending = (this.pendingGroupRefreshRows ??= new Set());
            pending.add(node as RowNode);
        } else {
            this.refreshGroupingForRows([node as RowNode]);
        }
    }
}
