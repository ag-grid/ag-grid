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
        if (_isClientSideRowModel(this.gos)) {
            this.addManagedListeners(this.eventSvc, {
                batchEditingStopped: () => this.flushGroupEdits(),
                cellValueChanged: (event) => this.onCsrmCellValueChange(event as CellValueChangedEvent),
            });
        }
    }

    public wouldCycle(row: IRowNode, newParent: IRowNode | null | undefined): boolean {
        if (!newParent || row.parent === newParent) {
            return false;
        }
        let current: IRowNode | null | undefined = newParent;
        const rowId = row.id;
        while (current) {
            if (current === row) {
                return true;
            }
            if (rowId != null && current.id === rowId) {
                return true;
            }
            current = current.parent;
        }
        return false;
    }

    public isGroupingDrop(rowsDrop: _RowsDrop): boolean {
        if (!rowsDrop.rowDragManaged || !rowsDrop.sameGrid) {
            return false;
        }
        if (!this.gos.get('refreshAfterGroupEdit')) {
            return false;
        }
        return !!this.beans.rowGroupColsSvc?.columns?.length;
    }

    public canSetParent(rowsDrop: _RowsDrop): boolean {
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

    public groupingEditDrop(rowsDrop: _RowsDrop): boolean {
        const groupColumns = this.beans.rowGroupColsSvc?.columns ?? [];
        if (!groupColumns.length) {
            return false;
        }

        const position = rowsDrop.position;
        const target = (rowsDrop.target as RowNode | null | undefined) ?? null;
        const rootNode = rowsDrop.rootNode as RowNode | null;
        const parentForValues = (rowsDrop.newParent as RowNode | null) ?? target?.parent ?? rootNode;
        const { groupValues, maxLevel } = buildGroupValuesFromParent(parentForValues, groupColumns);

        const focusSvc = this.beans.focusSvc;
        const cellPosition = focusSvc.getFocusedCell();
        const cellCtrl = cellPosition && _getCellByPosition(this.beans, cellPosition);

        const leafs = new Set<RowNode>();
        let dataChanged = false;

        for (const row of rowsDrop.rows as RowNode[]) {
            const leafRow = row.data ? (row as RowNode) : _firstLeaf(row.childrenAfterGroup);
            if (!leafRow) {
                continue;
            }
            leafs.add(leafRow);
            if (this.updateRowGroupValues(leafRow, groupColumns, groupValues, maxLevel)) {
                dataChanged = true;
            }
        }

        const reorderPosition = position === 'inside' ? 'above' : position;
        const reorderTarget = position === 'inside' ? findFirstLeafForParent(parentForValues, leafs) ?? target : target;
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

    private flushGroupEdits(): void {
        const pending = this.pendingGroupRefreshRows;
        if (pending?.size) {
            this.pendingGroupRefreshRows = null;
            this.refreshGroupingForRows(Array.from(pending));
        }
    }

    private refreshGroupingForRows(rows: RowNode[]): void {
        if (!rows.length) {
            return;
        }

        const rowModel = this.beans.rowModel as IClientSideRowModel;

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

    private updateRowGroupValues(
        row: RowNode,
        groupColumns: AgColumn[],
        groupValues: any[],
        maxLevel: number
    ): boolean {
        const { valueSvc, editSvc } = this.beans;
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
            if (currentValue === newValue || (currentValue == null && newValue == null)) {
                continue;
            }
            const result = editSvc?.setDataValue({ rowNode: row, column }, newValue, 'rowDrag');
            const updated = result != null ? !!result : row.setDataValue(column, newValue, 'rowDrag');
            if (updated) {
                changed = true;
            }
        }
        return changed;
    }

    private onCsrmCellValueChange(event: CellValueChangedEvent): void {
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

const findFirstLeafForParent = (parent: IRowNode | null, exclude: ReadonlySet<RowNode>): RowNode | null => {
    const children = parent?.childrenAfterGroup;
    if (!children) {
        return null;
    }
    for (const child of children) {
        const leaf = child.data ? (child as RowNode) : _firstLeaf(child.childrenAfterGroup);
        if (leaf && !exclude.has(leaf)) {
            return leaf;
        }
    }
    return null;
};

const buildGroupValuesFromParent = (
    parent: IRowNode | null,
    groupColumns: AgColumn[]
): { groupValues: any[]; maxLevel: number } => {
    const groupValues = new Array<any>(groupColumns.length);
    let maxLevel = -1;
    let current: IRowNode | null | undefined = parent;
    while (current && current.level >= 0) {
        const column: AgColumn | undefined = groupColumns[current.level];
        if (column) {
            const colId = column.getColId();
            const level = current.level;
            groupValues[level] = current.groupData?.[colId] ?? current.key ?? undefined;
            if (level > maxLevel) {
                maxLevel = level;
            }
        }
        current = current.parent;
    }
    return { groupValues, maxLevel };
};
