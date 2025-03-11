import type {
    AgColumn,
    BeanCollection,
    CssVariablesChanged,
    IPinnedRowModel,
    RowNode,
    RowPinnedType,
} from 'ag-grid-community';
import {
    BeanStub,
    _ROW_ID_PREFIX_BOTTOM_PINNED,
    _ROW_ID_PREFIX_TOP_PINNED,
    _getRowHeightForNode,
    _removeFromArray,
} from 'ag-grid-community';

import { _createRowNodeSibling } from '../misc/rowNodeSiblingUtils';

class OrderedSet {
    /** Canonical set of all pinned nodes */
    private all = new Set<RowNode>();
    /**
     * Set of nodes that should currently be visible given the context of the grid.
     * This is currently used for hiding leaf nodes in pivot mode.
     */
    private visible = new Set<RowNode>();
    /** Ordering of nodes in the pinned area */
    private order: RowNode[] = [];
    /**
     * We cache the row index of nodes to handle the case where they become not displayed (e.g
     * collapsing a group). Their `rowIndex` then becomes `null` and pinned row order becomes
     * unstable in a way that looks odd for users. In this case we fall back to their `rowIndex`
     * when they were last displayed.
     */
    private indexCache = new Map<RowNode, number>();

    public size(): number {
        return this.visible.size;
    }

    public add(item: RowNode): void {
        this.all.add(item);
        this.visible.add(item);
        this.order.push(item);
        this.sort();
    }

    public delete(item: RowNode): void {
        this.all.delete(item);
        this.visible.delete(item);
        _removeFromArray(this.order, item);
        this.indexCache.delete(item);
    }

    public has(item: RowNode): boolean {
        return this.visible.has(item);
    }

    public forEach(fn: (node: RowNode, i: number) => void): void {
        this.order.forEach(fn);
    }

    public getByIndex(i: number): RowNode | undefined {
        return this.order[i];
    }

    public getById(id: string): RowNode | undefined {
        for (const node of this.visible) {
            if (node.id == id) return node;
        }
    }

    public clear(): void {
        this.all.clear();
        this.visible.clear();
        this.indexCache.clear();
        this.order.length = 0;
    }

    public sort(): void {
        this.order.sort((a, b) => {
            const aOrig = a.pinnedSibling;
            const bOrig = b.pinnedSibling;

            if (!aOrig || !bOrig) return 0;

            if (aOrig.displayed) {
                this.indexCache.set(aOrig, aOrig.rowIndex!);
            }
            const aIndex = aOrig.rowIndex ?? this.indexCache.get(aOrig) ?? 0;

            if (bOrig?.displayed) {
                this.indexCache.set(bOrig, bOrig.rowIndex!);
            }
            const bIndex = bOrig.rowIndex ?? this.indexCache.get(bOrig) ?? 0;

            return aIndex - bIndex;
        });
    }

    public hide(shouldHide: (node: RowNode) => boolean): void {
        this.all.forEach((node) => (shouldHide(node) ? this.visible.delete(node) : this.visible.add(node)));
        this.order = Array.from(this.visible);
        this.sort();
    }
}

export class ManualPinnedRowModel extends BeanStub implements IPinnedRowModel {
    private top = new OrderedSet();
    private bottom = new OrderedSet();

    public postConstruct(): void {
        const filterManager = this.beans.filterManager;
        const hideFilteredNodes = (node: RowNode) =>
            filterManager ? !filterManager.doesRowPassFilter({ rowNode: node }) : false;

        this.addManagedEventListeners({
            gridStylesChanged: this.onGridStylesChanges.bind(this),
            modelUpdated: () => {
                this.forContainers((container) => {
                    container.hide(hideFilteredNodes);
                    container.sort();
                });
                this.refreshRowPositions();
            },
            columnRowGroupChanged: () => {
                this.forContainers(removeGroupRows);
                this.refreshRowPositions();
            },
        });

        this.addManagedPropertyListener('pivotMode', (event) => {
            const hideLeaves = (node: RowNode) => (event.currentValue ? !node.group : false);
            this.forContainers((container) => container.hide(hideLeaves));
            this.dispatchRowPinnedEvents();
        });
    }

    public override destroy(): void {
        this.forContainers((container) => {
            container.forEach(_destroyRowNodeSibling);
            container.clear();
        });

        super.destroy();
    }

    public pinRow(rowNode: RowNode, container: RowPinnedType, column?: AgColumn | null): void {
        // cell-span pinning/unpinning
        const spannedRows = column && getSpannedRows(this.beans, rowNode, column);
        if (spannedRows) {
            spannedRows.forEach((node) => this.pinRow(node, container));
            return;
        }

        // unpinning
        if (container == null) {
            // Want to act on the pinned row, not the original row
            const node = rowNode.rowPinned ? rowNode : rowNode.pinnedSibling!;
            const found = this.findPinnedRowNode(node);
            if (!found) return;

            found.delete(node);
            const original = node.pinnedSibling!;
            _destroyRowNodeSibling(node);
            this.refreshRowPositions(container);

            this.dispatchRowPinnedEvents(original);
        } else {
            // pinning
            const sibling = _createPinnedSibling(rowNode, this.beans, container);
            this.getContainer(container).add(sibling);
            this.refreshRowPositions(container);

            this.dispatchRowPinnedEvents(rowNode);
        }
    }

    public isManual(): boolean {
        return true;
    }

    public isEmpty(floating: NonNullable<RowPinnedType>): boolean {
        return this.getContainer(floating).size() === 0;
    }

    public isRowsToRender(floating: NonNullable<RowPinnedType>): boolean {
        return !this.isEmpty(floating);
    }

    public ensureRowHeightsValid(): boolean {
        let anyChange = false;
        let rowTop = 0;
        const updateRowHeight = (rowNode: RowNode) => {
            if (rowNode.rowHeightEstimated) {
                const rowHeight = _getRowHeightForNode(this.beans, rowNode);
                rowNode.setRowTop(rowTop);
                rowNode.setRowHeight(rowHeight.height);
                rowTop += rowHeight.height;
                anyChange = true;
            }
        };
        this.bottom.forEach(updateRowHeight);
        rowTop = 0;
        this.top.forEach(updateRowHeight);

        this.eventSvc.dispatchEvent({
            type: 'pinnedHeightChanged',
        });

        return anyChange;
    }

    public getPinnedTopTotalHeight(): number {
        const size = this.top.size();
        if (size === 0) return 0;

        const node = this.top.getByIndex(size - 1);
        if (node === undefined) return 0;

        return node.rowTop! + node.rowHeight!;
    }

    public getPinnedBottomTotalHeight(): number {
        const size = this.bottom.size();
        if (size === 0) return 0;

        const node = this.bottom.getByIndex(size - 1);
        if (node === undefined) return 0;

        return node.rowTop! + node.rowHeight!;
    }

    public getPinnedTopRowCount(): number {
        return this.top.size();
    }

    public getPinnedBottomRowCount(): number {
        return this.bottom.size();
    }

    public getPinnedTopRow(index: number): RowNode | undefined {
        return this.top.getByIndex(index);
    }

    public getPinnedBottomRow(index: number): RowNode | undefined {
        return this.bottom.getByIndex(index);
    }

    public getPinnedRowById(id: string, floating: NonNullable<RowPinnedType>): RowNode | undefined {
        return this.getContainer(floating).getById(id);
    }

    public forEachPinnedRow(
        floating: NonNullable<RowPinnedType>,
        callback: (node: RowNode, index: number) => void
    ): void {
        this.getContainer(floating).forEach(callback);
    }

    private onGridStylesChanges(e: CssVariablesChanged) {
        if (e.rowHeightChanged) {
            const estimateRowHeight = (rowNode: RowNode) => {
                rowNode.setRowHeight(rowNode.rowHeight, true);
            };
            this.bottom.forEach(estimateRowHeight);
            this.top.forEach(estimateRowHeight);
        }
    }

    private getContainer(container: NonNullable<RowPinnedType>): OrderedSet {
        return container === 'top' ? this.top : this.bottom;
    }

    private findPinnedRowNode(node: RowNode): OrderedSet | undefined {
        if (this.top.has(node)) return this.top;
        if (this.bottom.has(node)) return this.bottom;
    }

    private refreshRowPositions(container?: RowPinnedType): void {
        const sets = container == null ? ['top' as const, 'bottom' as const] : [container];
        sets.forEach((float) => refreshRowPositions(this.beans, this.getContainer(float)));
    }

    private forContainers(fn: (container: OrderedSet) => void): void {
        fn(this.top);
        fn(this.bottom);
    }

    private dispatchRowPinnedEvents(node?: RowNode): void {
        this.eventSvc.dispatchEvent({ type: 'rowPinnedChanged' });
        node?.dispatchRowEvent('rowPinned');
    }
}

function refreshRowPositions(beans: BeanCollection, container: OrderedSet) {
    let rowTop = 0;
    container.forEach((node, index) => {
        node.setRowTop(rowTop);
        node.setRowHeight(_getRowHeightForNode(beans, node).height);
        node.setRowIndex(index);
        rowTop += node.rowHeight!;
    });
}

function _createPinnedSibling(rowNode: RowNode, beans: BeanCollection, container: NonNullable<RowPinnedType>): RowNode {
    // only create sibling node once, otherwise we have daemons and
    // the animate screws up with the daemons hanging around
    if (rowNode.pinnedSibling) {
        return rowNode.pinnedSibling;
    }

    const sibling = _createRowNodeSibling(rowNode, beans);

    sibling.setRowTop(null);
    sibling.setRowIndex(null);
    sibling.rowPinned = container;

    const prefix = container === 'top' ? _ROW_ID_PREFIX_TOP_PINNED : _ROW_ID_PREFIX_BOTTOM_PINNED;

    sibling.id = `${prefix}${container}-${rowNode.id}`;

    // get both header and footer to reference each other as siblings
    sibling.pinnedSibling = rowNode;
    rowNode.pinnedSibling = sibling;

    return sibling;
}

/** Expect to be passed the pinned node, not the original node. Therefore `sibling` is the original. */
function _destroyRowNodeSibling(rowNode: RowNode): void {
    if (!rowNode.pinnedSibling) {
        return;
    }

    rowNode.rowPinned = null;
    rowNode.setRowTop(null);
    rowNode.setRowIndex(null);

    const mainNode = rowNode.pinnedSibling;
    rowNode.pinnedSibling = undefined as any;

    if (mainNode) {
        mainNode.pinnedSibling = undefined as any;
        mainNode.rowPinned = null;
    }
}

function removeGroupRows(set: OrderedSet) {
    const rowsToRemove = new Set<RowNode>();
    set.forEach((node) => {
        if (node.group) {
            rowsToRemove.add(node);
        }
    });

    rowsToRemove.forEach((node) => {
        set.delete(node);
    });
}

function getSpannedRows(beans: BeanCollection, rowNode: RowNode, column: AgColumn) {
    const { rowSpanSvc } = beans;
    const isCellSpanning = (column && rowSpanSvc?.isCellSpanning(column, rowNode)) ?? false;
    if (column && isCellSpanning) {
        const span = rowSpanSvc?.getCellSpan(column, rowNode);
        if (span) return Array.from(span.spannedNodes);
    }
}
