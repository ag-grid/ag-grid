import type { BeanCollection, CssVariablesChanged, IPinnedRowModel, RowPinnedType } from 'ag-grid-community';
import {
    BeanStub,
    RowNode,
    _ROW_ID_PREFIX_BOTTOM_PINNED,
    _ROW_ID_PREFIX_TOP_PINNED,
    _getRowHeightForNode,
    _removeFromArray,
    _warn,
} from 'ag-grid-community';

class OrderedSet {
    private set = new Set<RowNode>();
    private cachedOrder: RowNode[] = [];

    public size(): number {
        return this.set.size;
    }

    public add(item: RowNode): void {
        this.set.add(item);
        this.cachedOrder.push(item);
        this.sort();
    }

    public delete(item: RowNode): void {
        this.set.delete(item);
        _removeFromArray(this.cachedOrder, item);
    }

    public has(item: RowNode): boolean {
        return this.set.has(item);
    }

    public forEach(fn: (node: RowNode, i: number) => void): void {
        this.cachedOrder.forEach(fn);
    }

    public getByIndex(i: number): RowNode | undefined {
        return this.cachedOrder[i];
    }

    public getById(id: string): RowNode | undefined {
        return this.cachedOrder.find((node) => node.id === id);
    }

    public clear(): void {
        this.set.clear();
        this.cachedOrder.length = 0;
    }

    public sort(): void {
        this.cachedOrder.sort((a, b) => (a.pinnedSibling?.rowIndex ?? 0) - (b.pinnedSibling?.rowIndex ?? 0));
    }
}

export class ManualPinnedRowModel extends BeanStub implements IPinnedRowModel {
    private top = new OrderedSet();
    private bottom = new OrderedSet();

    public postConstruct(): void {
        this.addManagedEventListeners({
            gridStylesChanged: this.onGridStylesChanges.bind(this),
            modelUpdated: () => {
                this.top.sort();
                this.bottom.sort();
                this.refreshRowPositions();
            },
            columnRowGroupChanged: () => {
                removeGroupRows(this.top);
                removeGroupRows(this.bottom);
                this.refreshRowPositions();
            },
        });

        this.validatePinningOptions();
    }

    public override destroy(): void {
        this.top.forEach(_destroyRowNodeSibling);
        this.top.clear();

        this.bottom.forEach(_destroyRowNodeSibling);
        this.bottom.clear();

        super.destroy();
    }

    public pinRow(rowNode: RowNode, container: RowPinnedType): void {
        // unpinning
        if (container == null) {
            const node = rowNode.manualPinned ? rowNode : rowNode.pinnedSibling!;
            const found = this.findPinnedRowNode(node);
            if (!found) return;

            found[1].delete(node);
            const original = node.pinnedSibling!;
            _destroyRowNodeSibling(node);
            this.refreshRowPositions(container);

            this.dispatchRowPinnedEvents(original);
            return;
        }

        // pinning
        rowNode.rowPinned = container;
        const sibling = _createRowNodeSibling(rowNode, this.beans, container);
        this.getContainer(container).add(sibling);
        this.refreshRowPositions(container);

        this.dispatchRowPinnedEvents(rowNode);
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

    private findPinnedRowNode(node: RowNode): [NonNullable<RowPinnedType>, OrderedSet] | undefined {
        if (this.top.has(node)) return ['top', this.top];
        if (this.bottom.has(node)) return ['bottom', this.bottom];
    }

    private refreshRowPositions(container?: RowPinnedType): void {
        const sets = container == null ? ['top' as const, 'bottom' as const] : [container];
        sets.forEach((float) => refreshRowPositions(this.beans, this.getContainer(float)));
    }

    private dispatchRowPinnedEvents(node: RowNode): void {
        this.eventSvc.dispatchEvent({ type: 'rowPinnedChanged', node });
        node.dispatchRowEvent('rowPinned');
    }

    private validatePinningOptions(): void {
        const gos = this.gos;
        const enableRowPinning = gos.get('enableRowPinning');
        const pinnedTopRowData = gos.get('pinnedTopRowData');
        const pinnedBottomRowData = gos.get('pinnedBottomRowData');

        if (enableRowPinning && (pinnedTopRowData || pinnedBottomRowData)) {
            _warn(272);
        }
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

/**
 * When creating sibling nodes (e.g. footers), we don't copy these properties as they
 * cause the sibling to have properties which should be unique to the row.
 *
 * Note that `keyof T` does not include private members of `T`, so these need to be
 * added explicitly to this list. Take care when adding or renaming private properties
 * of `RowNode`.
 */
const IGNORED_SIBLING_PROPERTIES = new Set<
    keyof RowNode | '__localEventService' | '__autoHeights' | '__checkAutoHeightsDebounced'
>(['__localEventService', '__objectId', 'sticky', '__autoHeights', '__checkAutoHeightsDebounced']);

function _createRowNodeSibling(
    rowNode: RowNode,
    beans: BeanCollection,
    container: NonNullable<RowPinnedType>
): RowNode {
    // only create sibling node once, otherwise we have daemons and
    // the animate screws up with the daemons hanging around
    if (rowNode.pinnedSibling) {
        return rowNode.pinnedSibling;
    }

    const sibling = new RowNode(beans);

    Object.keys(rowNode).forEach((key: keyof RowNode) => {
        if (IGNORED_SIBLING_PROPERTIES.has(key)) {
            return;
        }
        (sibling as any)[key] = (rowNode as any)[key];
    });

    sibling.setRowTop(null);
    sibling.setRowIndex(null);
    sibling.manualPinned = true;

    // manually set oldRowTop to null so we discard any
    // previous information about its position.
    sibling.oldRowTop = null;

    const prefix = container === 'top' ? _ROW_ID_PREFIX_TOP_PINNED : _ROW_ID_PREFIX_BOTTOM_PINNED;

    sibling.id = `${prefix}${container}-${rowNode.id}`;

    // get both header and footer to reference each other as siblings. this is never undone,
    // only overwritten. so if a group is expanded, then contracted, it will have a ghost
    // sibling - but that's fine, as we can ignore this if the header is contracted.
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
