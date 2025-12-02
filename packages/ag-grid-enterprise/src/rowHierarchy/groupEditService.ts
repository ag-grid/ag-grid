import type {
    AgColumn,
    CellValueChangedEvent,
    IClientSideRowModel,
    IRowNode,
    RowNode,
    _IGroupEditService,
    _RowsDrop,
} from 'ag-grid-community';
import {
    BeanStub,
    ChangedPath,
    _ChangedRowNodes,
    _csrmFirstLeaf,
    _csrmReorderAllLeafs,
    _getCellByPosition,
    _isClientSideRowModel,
    _prevOrNextDisplayedRow,
} from 'ag-grid-community';

export class GroupEditService extends BeanStub implements _IGroupEditService {
    public beanName = 'groupEditSvc' as const;

    private pendingEditRefresh: _ChangedRowNodes | null = null;
    private dropGroupTarget: IRowNode | null = null;
    private dropGroupTimer: number | null = null;
    private dropGroupThrottled = false;
    private draggingGroups: Map<IRowNode, RowNode[]> | null = null;

    public postConstruct(): void {
        if (_isClientSideRowModel(this.gos)) {
            this.addManagedListeners(this.eventSvc, {
                cellValueChanged: (event) => this.onCsrmCellChange(event),
                batchEditingStopped: () => this.flushGroupEdits(),
            });
        }
    }

    public override destroy(): void {
        this.stopDragging(true);
        super.destroy();
    }

    /** Checks if the drop operation described by `rowsDrop` is a grouping edit */
    public isGroupingDrop(rowsDrop: _RowsDrop): boolean {
        if (!rowsDrop.rowDragManaged || !rowsDrop.sameGrid) {
            return false;
        }
        if (!this.gos.get('refreshAfterGroupEdit')) {
            return false;
        }
        return !!this.beans.rowGroupColsSvc?.columns?.length && !this.gos.get('pivotMode');
    }

    private initDraggingGroups(rowsDrop: _RowsDrop): void {
        const structure = new Map<IRowNode, RowNode[]>();

        // Let's make a copy of all the children being dragged
        const recurse = (row: RowNode) => {
            const childrenAfterGroup = row.childrenAfterGroup;
            if (childrenAfterGroup) {
                if (structure.has(row)) {
                    return;
                }
                const children = childrenAfterGroup.slice();
                structure.set(row, children);
                for (const child of children) {
                    recurse(child);
                }
            }
        };
        for (const row of rowsDrop.rows) {
            if (row.group) {
                recurse(row as RowNode);
            }
        }
        this.draggingGroups = structure;
    }

    /** Checks if the drop operation described by `rowsDrop` can set a new parent */
    public canSetParent(rowsDrop: _RowsDrop): boolean {
        if (!rowsDrop.sameGrid) {
            return false;
        }
        if (this.beans.groupStage?.treeData) {
            return true;
        }
        if (rowsDrop.rowDragManaged && !this.gos.get('refreshAfterGroupEdit')) {
            return false;
        }
        return !!this.beans.rowGroupColsSvc?.columns?.length;
    }

    public canDropRow(rowNode: IRowNode, rowsDrop: _RowsDrop): boolean {
        if (this.beans.groupStage?.treeData) {
            return !wouldCycle(rowNode, rowsDrop.newParent);
        }

        const { position, target, newParent, rootNode } = rowsDrop;
        const currentParent = rowNode.parent!;

        if (rowNode.group && (isAncestorOrSelf(rowNode, target) || isAncestorOrSelf(rowNode, newParent))) {
            return false;
        }

        if (position === 'inside') {
            return true;
        }
        if (newParent && newParent !== currentParent) {
            return newParent !== rootNode || currentParent === rootNode;
        }

        const comparisonParent = newParent ?? target?.parent ?? rootNode;
        if (comparisonParent !== currentParent) {
            return false;
        }

        const sourceLevel = rowNode.group ? rowNode.level : currentParent.level ?? -1;
        const targetLevel = target
            ? target.group
                ? target.level
                : target.parent?.level ?? -1
            : comparisonParent?.level ?? -1;

        if (sourceLevel >= 0 && targetLevel >= 0 && targetLevel !== sourceLevel) {
            return false;
        }

        return true;
    }

    public fixRowsDrop(rowsDrop: _RowsDrop, canSetParent: boolean, fromNudge: boolean, yDelta: number): void {
        const treeData = !!this.beans.groupStage?.treeData;
        rowsDrop.treeData = treeData;

        const isRowGrouping = !!this.beans.rowGroupColsSvc?.columns?.length || this.gos.get('pivotMode');
        if (!isRowGrouping && !treeData) {
            return; // Early exit, no grouping (managed or unmanaged) and no treeData
        }

        if (!this.draggingGroups && this.isGroupingDrop(rowsDrop) && !rowsDrop.suppressMoveWhenRowDragging) {
            this.initDraggingGroups(rowsDrop);
        }

        let target = rowsDrop.target;
        let newParent: IRowNode | null = null;
        let inside = false;

        const rootNode = rowsDrop.rootNode as IRowNode;
        const rowModel = this.beans.rowModel;
        const canStartGroup = target ? this.canDropStartGroup(target) : false;

        this.updateDropTarget(canStartGroup ? target : null, fromNudge, rowsDrop);

        const lastRowIndex = this.beans.pageBounds?.getLastRow?.() ?? rowModel.getRowCount() - 1;
        if (canSetParent) {
            if (!target || (yDelta >= 0.5 && target.rowIndex === lastRowIndex)) {
                newParent = rootNode;
            } else if (rowsDrop.moved && target && this.dropGroupThrottled && this.shouldDropTargetBeParent(rowsDrop)) {
                newParent = target;
            }

            if (!newParent) {
                newParent = target?.parent ?? rootNode;
            }

            if (
                !fromNudge &&
                target &&
                canStartGroup &&
                (!newParent || (!target.expanded && !!target.childrenAfterSort?.length))
            ) {
                this.startDropGroupDelay(target);
            }
        } else if (!fromNudge && target && canStartGroup) {
            this.startDropGroupDelay(target);
        }

        if (newParent) {
            if (target && newParent === target && newParent !== rootNode) {
                const firstRow = newParent.expanded ? _prevOrNextDisplayedRow(rowModel, 1, target) : null;
                if (firstRow?.parent === newParent) {
                    target = firstRow;
                    yDelta = -0.5;
                } else {
                    inside = true;
                }
            }

            if (target && !inside) {
                let current: IRowNode | null = target;
                while (current && current !== rootNode && current !== newParent) {
                    target = current;
                    current = current.parent;
                }
            }
        }

        rowsDrop.target = target;
        rowsDrop.newParent = newParent;
        rowsDrop.yDelta = yDelta;
        rowsDrop.inside = inside;
    }

    public clearNewSameParent(rowsDrop: _RowsDrop, canSetParent: boolean): void {
        const newParent = rowsDrop.newParent;
        if (newParent && (!canSetParent || rowsHaveSameParent(rowsDrop.rows, newParent))) {
            rowsDrop.newParent = null;
        }
    }

    private updateDropTarget(target: IRowNode | null, canExpand: boolean, rowsDrop: _RowsDrop): void {
        if (this.dropGroupTarget && this.dropGroupTarget !== target) {
            this.resetDragGroup();
        }

        if (!target?.childrenAfterSort?.length) {
            return;
        }

        if (canExpand && this.dropGroupThrottled && !target.expanded && target.isExpandable?.()) {
            target.setExpanded(true, undefined, true);
        }

        if (this.canDropInTarget(target, rowsDrop)) {
            this.dropGroupThrottled = true;
            this.dropGroupTarget = target;
        }
    }

    private canDropInTarget(target: IRowNode, rowsDrop: _RowsDrop): boolean {
        if (target.expanded) {
            return true;
        }
        if (!target.group) {
            return false;
        }
        if (rowsDrop.pointerPos === 'inside') {
            return true;
        }
        if (rowsDrop.treeData) {
            return false;
        }
        const rows = rowsDrop.rows;
        const targetLevel = target.level;
        for (let i = 0, len = rows.length; i < len; ++i) {
            const row = rows[i];
            if (row !== target && row.group && row.level !== targetLevel) {
                return false;
            }
        }
        return true;
    }

    private startDropGroupDelay(target: IRowNode): void {
        if (this.dropGroupTarget && this.dropGroupTarget !== target) {
            this.resetDragGroup();
        }

        this.dropGroupTarget = target;

        if (this.dropGroupTimer !== null) {
            return;
        }

        const delay = this.gos.get('rowDragInsertDelay');
        this.dropGroupTimer = window.setTimeout(() => {
            this.dropGroupTimer = null;
            this.dropGroupThrottled = true;
            this.beans.dragAndDrop?.nudge();
        }, delay);
    }

    public resetDragGroup(): void {
        if (this.dropGroupTimer !== null) {
            window.clearTimeout(this.dropGroupTimer);
            this.dropGroupTimer = null;
        }
        this.dropGroupTarget = null;
        this.dropGroupThrottled = false;
    }

    public stopDragging(final: boolean): void {
        if (final) {
            this.draggingGroups = null;
        }
        this.resetDragGroup();
    }

    private shouldDropTargetBeParent({ target, rows, pointerPos, treeData }: _RowsDrop): boolean {
        if (!target || pointerPos === 'none') {
            return false;
        }
        if (pointerPos === 'inside') {
            return true;
        }
        if (!treeData && target.group && !target.expanded) {
            return true;
        }
        if (pointerPos === 'above') {
            return false;
        }
        const rowModel = this.beans.rowModel;
        const targetRowIndex = target.rowIndex!;
        let nextRowIndex = targetRowIndex + 1;
        let nextRow: RowNode | undefined;
        do {
            nextRow = rowModel.getRow(nextRowIndex++);
        } while (nextRow?.footer);

        const childrenAfterGroup = this.draggingGroups?.get(target) ?? target.childrenAfterGroup;
        if (nextRow && nextRow.parent === target && childrenAfterGroup?.length) {
            const rowsSet = new Set(rows);
            for (let i = 0, len = childrenAfterGroup.length; i < len; ++i) {
                const child = childrenAfterGroup[i];
                if (child.rowIndex !== null && !rowsSet.has(child)) {
                    return true;
                }
            }
        }
        return false;
    }

    /** Performs the grouping edit described by `rowsDrop` */
    public dropGroupEdit(rowsDrop: _RowsDrop): boolean {
        const { beans } = this;

        const position = rowsDrop.position;
        const target = (rowsDrop.target as RowNode | null | undefined) ?? null;
        const rootNode = rowsDrop.rootNode as RowNode;
        const parentForValues = (rowsDrop.newParent as RowNode | null) ?? target?.parent ?? rootNode;

        const focusSvc = beans.focusSvc;
        const cellPosition = focusSvc.getFocusedCell();
        const cellCtrl = cellPosition && _getCellByPosition(beans, cellPosition);

        const leafs = new Set<RowNode>();
        const changedRowNodes = new _ChangedRowNodes();
        const updates = changedRowNodes.updates;

        let newGroupValues: GroupValues | undefined;
        const processLeaf = (leafRow: RowNode): void => {
            if (leafs.has(leafRow)) {
                return;
            }
            leafs.add(leafRow);
            newGroupValues ??= this.newGroupValues(parentForValues);
            if (this.setRowGroup(leafRow, newGroupValues)) {
                updates.add(leafRow);
            }
        };

        const visitGroupedChildren = (groupNode: RowNode): void => {
            const children = this.draggingGroups?.get(groupNode) ?? groupNode.childrenAfterGroup;
            const childrenLen = children?.length;
            if (childrenLen) {
                for (let i = 0; i < childrenLen; ++i) {
                    const child = children[i] as RowNode;
                    if (child.sourceRowIndex >= 0) {
                        processLeaf(child);
                    } else {
                        visitGroupedChildren(child);
                    }
                }
            }
        };

        for (const row of rowsDrop.rows as RowNode[]) {
            if (row.group) {
                visitGroupedChildren(row);
            } else {
                const firstLeaf = row.sourceRowIndex >= 0 && !row.destroyed ? row : this.csrmFirstLeaf(row);
                if (firstLeaf) {
                    processLeaf(firstLeaf);
                }
            }
        }

        const reorderPosition = position === 'inside' ? 'above' : position;
        const reorderTarget =
            position === 'inside' ? this.findFirstLeafForParent(parentForValues, leafs) ?? target : target;
        let orderChanged = false;
        if (leafs.size && reorderPosition !== 'none') {
            orderChanged = _csrmReorderAllLeafs(rootNode._leafs, leafs, reorderTarget, reorderPosition === 'above');
        }

        if (!updates.size && !orderChanged) {
            return false;
        }

        changedRowNodes.reordered = orderChanged;
        for (const leaf of leafs) {
            changedRowNodes.updates.add(leaf);
        }
        this.csrmRefresh(changedRowNodes);

        if (cellCtrl) {
            cellCtrl.focusCell();
        } else {
            focusSvc.clearFocusedCell();
        }

        return true;
    }

    public canDropStartGroup(candidate: IRowNode | null | undefined) {
        return (
            !!candidate &&
            candidate.level >= 0 &&
            !candidate.footer &&
            !candidate.detail &&
            (candidate.isExpandable?.() || !!candidate.childrenAfterSort?.length)
        );
    }

    /** Flushes any pending group edits for batch processing */
    private flushGroupEdits(): void {
        const pending = this.pendingEditRefresh;
        if (pending) {
            this.pendingEditRefresh = null;
            this.csrmRefresh(pending);
        }
    }

    /** Refreshes the grouping for the provided rows */
    private csrmRefresh(changedRowNodes: _ChangedRowNodes): void {
        const clientSideRowModel = this.beans.rowModel as IClientSideRowModel;
        const rootNode = clientSideRowModel.rootNode;
        if (!rootNode) {
            return; // Destroyed
        }
        clientSideRowModel.refreshModel({
            step: 'group',
            keepRenderedRows: true,
            animate: !this.gos.get('suppressAnimationFrame'),
            changedPath: new ChangedPath(false, rootNode),
            changedRowNodes,
        });
    }

    private newGroupValues(parent: IRowNode | null): GroupValues {
        const columns = this.beans.rowGroupColsSvc?.columns ?? [];
        const values = new Array<any>(columns.length);
        let maxLevel = -1;
        let current: IRowNode | null | undefined = parent;
        while (current && current.level >= 0) {
            const column: AgColumn | undefined = columns[current.level];
            if (column) {
                const colId = column.getColId();
                const level = current.level;
                values[level] = current.groupData?.[colId] ?? current.key ?? undefined;
                if (level > maxLevel) {
                    maxLevel = level;
                }
            }
            current = current.parent;
        }
        return { values, columns, maxLevel };
    }

    private setRowGroup(row: RowNode, { values, columns, maxLevel }: GroupValues): boolean {
        if (maxLevel < 0) {
            return false;
        }
        const { valueSvc, editSvc } = this.beans;
        let changed = false;
        for (let level = 0; level < columns.length; ++level) {
            const column = columns[level];
            if (!column || level > maxLevel) {
                continue;
            }
            const newValue = values[level];
            const currentValue = valueSvc.getValue(column, row, false, 'api');
            if (currentValue === newValue || (currentValue == null && newValue == null)) {
                continue;
            }
            let valueToSet = newValue;
            const parsedValue = valueSvc.parseValue(column, row, newValue, currentValue);
            if (parsedValue !== undefined) {
                valueToSet = parsedValue;
            }
            const result = editSvc?.setDataValue({ rowNode: row, column }, valueToSet, 'rowDrag');
            const updated = result != null ? !!result : row.setDataValue(column, valueToSet, 'rowDrag');
            if (updated) {
                changed = true;
            }
        }
        return changed;
    }

    private onCsrmCellChange(event: CellValueChangedEvent): void {
        const { column, node, source } = event;
        if (!this.gos.get('refreshAfterGroupEdit')) {
            return;
        }

        if (source === 'rowDrag') {
            return; // Row drag changes are handled separately in groupingEditDrop
        }

        if (!column?.isRowGroupActive()) {
            return;
        }

        if (node.group || !node.data) {
            return;
        }

        const editSvc = this.beans.editSvc;
        if (editSvc?.isBatchEditing()) {
            let pending = this.pendingEditRefresh;
            if (!pending) {
                pending = newEditChangedRowNodes();
                this.pendingEditRefresh = pending;
            }
            pending.updates.add(node as RowNode);
        } else {
            const changedRowNodes = newEditChangedRowNodes();
            changedRowNodes.updates.add(node as RowNode);
            this.csrmRefresh(changedRowNodes);
        }
    }

    public csrmFirstLeaf(parent: IRowNode | null): RowNode | null {
        if (!parent) {
            return null;
        }
        const draggingGroups = this.draggingGroups;
        let children: IRowNode[] | null | undefined = draggingGroups?.get(parent) ?? parent.childrenAfterGroup;
        while (children?.length) {
            const child: IRowNode = children[0];
            if (child.sourceRowIndex >= 0) {
                if (!child.destroyed) {
                    return child as RowNode;
                }
                return this.firstAliveChildLeaf(child);
            }
            children = draggingGroups?.get(child) ?? child.childrenAfterGroup;
        }
        return _csrmFirstLeaf(parent) as RowNode | null;
    }

    private firstAliveChildLeaf(parent: IRowNode): RowNode | null {
        const children = this.draggingGroups?.get(parent) ?? parent.childrenAfterGroup;
        if (children) {
            for (const grandChild of children) {
                if (grandChild.sourceRowIndex >= 0 && !grandChild.destroyed) {
                    return grandChild as RowNode;
                }
            }
        }
        return null;
    }

    private findFirstLeafForParent(parent: IRowNode | null, exclude: ReadonlySet<RowNode>): RowNode | null {
        if (!parent) {
            return null;
        }
        const children = this.draggingGroups?.get(parent) ?? parent?.childrenAfterGroup;
        if (!children) {
            return null;
        }
        for (let i = 0, len = children.length; i < len; ++i) {
            const child = children[i] as RowNode;
            if (child.sourceRowIndex >= 0 && !exclude.has(child)) {
                return child;
            }
            const found = this.findFirstLeafForParent(child, exclude);
            if (found !== null) {
                return found;
            }
        }
        return null;
    }
}

const newEditChangedRowNodes = (): _ChangedRowNodes => {
    const result = new _ChangedRowNodes();
    result.reordered = true; // Force grouping to follow _leafs order
    return result;
};

interface GroupValues {
    maxLevel: number;
    columns: AgColumn[];
    values: any[];
}

const isAncestorOrSelf = (candidate: IRowNode | null | undefined, node: IRowNode | null | undefined): boolean => {
    if (!candidate || !node) {
        return false;
    }
    let current: IRowNode | null | undefined = node;
    while (current) {
        if (current === candidate) {
            return true;
        }
        current = current.parent;
    }
    return false;
};

/** Checks if setting `newParent` as the parent of `row` would create a cycle in the tree hierarchy */
const wouldCycle = (row: IRowNode, newParent: IRowNode | null | undefined): boolean => {
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
};

const rowsHaveSameParent = (rows: IRowNode<any>[], newParent: IRowNode): boolean => {
    for (let i = 0, len = rows.length; i < len; ++i) {
        if (rows[i].parent !== newParent) {
            return false;
        }
    }
    return true;
};
