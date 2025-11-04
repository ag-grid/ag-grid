import { _areEqual } from '../agStack/utils/array';
import { ChangedRowNodes } from '../clientSideRowModel/changedRowNodes';
import { BeanStub } from '../context/beanStub';
import { _getCellByPosition } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import { _firstLeaf } from '../entities/rowNodeUtils';
import type { RowDragEvent, RowDragEventType } from '../events';
import { _getNormalisedMousePosition } from '../gridBodyComp/mouseEventUtils';
import { _getRowIdCallback, _isClientSideRowModel } from '../gridOptionsUtils';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IRowNode } from '../interfaces/iRowNode';
import { ChangedPath } from '../utils/changedPath';
import { _warn } from '../validation/logging';
import type { DragAndDropIcon, DropTarget } from './dragAndDropService';
import { DragSourceType } from './dragAndDropService';
import { RowDragFeatureNudger } from './rowDragFeatureNudger';
import type { RowDraggingEvent, RowDropZoneEvents, RowDropZoneParams, RowsDrop } from './rowDragTypes';

/** We actually have a different interface if we are passing params out of the grid and
 * directly into another grid. These internal params just work directly off the DraggingEvent.
 * However, we don't want to expose these to the user, so we have a different interface for
 * them called RowDropZoneParams which works with RowDragEvents.
 */
interface InternalRowDropZoneEvents {
    /** Callback function that will be executed when the rowDrag enters the target. */
    onDragEnter?: (params: RowDraggingEvent) => void;
    /** Callback function that will be executed when the rowDrag leaves the target */
    onDragLeave?: (params: RowDraggingEvent) => void;
    /**
     * Callback function that will be executed when the rowDrag is dragged inside the target.
     * Note: this gets called multiple times.
     */
    onDragging?: (params: RowDraggingEvent) => void;
    /** Callback function that will be executed when the rowDrag drops rows within the target. */
    onDragStop?: (params: RowDraggingEvent) => void;
    onDragCancel?: (params: RowDraggingEvent) => void;
}
interface InternalRowDropZoneParams extends InternalRowDropZoneEvents {
    /** A callback method that returns the DropZone HTMLElement. */
    getContainer: () => HTMLElement;
    /** internal flag for identifying params from the grid. */
    fromGrid?: boolean;
}

export class RowDragFeature extends BeanStub implements DropTarget {
    private lastDraggingEvent: RowDraggingEvent | null = null;
    private nudger: RowDragFeatureNudger | null = null;

    constructor(private eContainer: HTMLElement | null) {
        super();
    }

    public postConstruct(): void {
        const beans = this.beans;

        beans.ctrlsSvc.whenReady(this, (p) => {
            this.nudger = new RowDragFeatureNudger(beans, p.gridBodyCtrl);
        });
    }

    public override destroy(): void {
        super.destroy();
        this.nudger?.clear();
        this.nudger = null;
        this.lastDraggingEvent = null;
        this.eContainer = null;
    }

    public getContainer(): HTMLElement {
        return this.eContainer!;
    }

    public isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.RowDrag;
    }

    public getIconName(draggingEvent: RowDraggingEvent | null): DragAndDropIcon {
        if (draggingEvent?.dropTarget?.allowed === false) {
            return 'notAllowed';
        }

        if (this.gos.get('rowDragManaged') && this.shouldPreventRowMove()) {
            return 'notAllowed';
        }

        return 'move';
    }

    public shouldPreventRowMove(): boolean {
        const { rowGroupColsSvc, filterManager, sortSvc } = this.beans;
        const rowGroupCols = rowGroupColsSvc?.columns ?? [];
        if (rowGroupCols.length) {
            return true;
        }
        const isFilterPresent = filterManager?.isAnyFilterPresent();
        if (isFilterPresent) {
            return true;
        }
        const isSortActive = sortSvc?.isSortActive();
        if (isSortActive) {
            return true;
        }
        return false;
    }

    private getRowNodes(draggingEvent: RowDraggingEvent): RowNode[] {
        if (!this.isFromThisGrid(draggingEvent)) {
            return (draggingEvent.dragItem.rowNodes || []) as RowNode[];
        }
        const currentNode = draggingEvent.dragItem.rowNode! as RowNode;
        if (this.gos.get('rowDragMultiRow')) {
            const selectedNodes = this.beans.selectionSvc?.getSelectedNodes();
            if (selectedNodes && selectedNodes.indexOf(currentNode) >= 0) {
                return selectedNodes.slice().sort(compareRowIndex);
            }
        }
        return [currentNode];
    }

    public onDragEnter(draggingEvent: RowDraggingEvent): void {
        this.dragging(draggingEvent, true);
    }

    public onDragging(draggingEvent: RowDraggingEvent): void {
        this.dragging(draggingEvent, false);
    }

    private dragging(draggingEvent: RowDraggingEvent, enter: boolean): void {
        const { lastDraggingEvent, beans } = this;

        if (enter) {
            const rowNodes = this.getRowNodes(draggingEvent);
            draggingEvent.dragItem.rowNodes = rowNodes;
            setRowNodesDragging(rowNodes, true);
        }

        this.lastDraggingEvent = draggingEvent;
        const fromNudge = draggingEvent.fromNudge;

        const rowsDrop = this.makeRowsDrop(lastDraggingEvent, draggingEvent, fromNudge, false);
        beans.rowDropHighlightSvc?.fromDrag(draggingEvent);

        if (enter) {
            this.dispatchGridEvent('rowDragEnter', draggingEvent); // we fire both the enter and move.
        }
        this.dispatchGridEvent('rowDragMove', draggingEvent);

        if (
            rowsDrop?.rowDragManaged &&
            rowsDrop.moved &&
            rowsDrop.allowed &&
            rowsDrop.sameGrid &&
            !rowsDrop.suppressMoveWhenRowDragging &&
            // Avoid flickering by only dropping while auto-scrolling is not happening
            ((!fromNudge && !this.nudger?.autoScroll.scrolling) || this.nudger?.scrollChanged)
        ) {
            this.dropRows(rowsDrop); // Drop the rows while dragging
        }

        this.nudger?.autoScroll.check(draggingEvent.event);
    }

    private isFromThisGrid(draggingEvent: RowDraggingEvent) {
        return draggingEvent.dragSource.dragSourceDomDataKey === this.gos.getDomDataKey();
    }

    private makeRowsDrop(
        lastDraggingEvent: RowDraggingEvent | null,
        draggingEvent: RowDraggingEvent,
        moving: boolean,
        dropping: boolean
    ): RowsDrop | null {
        const { beans, gos } = this;
        const rowsDrop = this.newRowsDrop(draggingEvent, dropping);
        const rowModel = beans.rowModel;
        draggingEvent.dropTarget = rowsDrop;
        draggingEvent.changed = false;
        if (!rowsDrop) {
            return null;
        }

        let { sameGrid, rootNode, source, target, rows } = rowsDrop;

        target ??= rowModel.getRow(rowModel.getRowCount() - 1) ?? null;

        const canSetParent =
            // We don't yet support drag and drop with grouping
            !!this.beans.groupStage?.treeData &&
            // We don't yet support moving tree rows from a different grid in a structured way
            sameGrid;

        let newParent: IRowNode | null = null;
        if (target?.footer) {
            // Footer row. Get the real parent, that is the sibling of the footer
            const found = getPrevOrNext(rowModel, -1, target) ?? getPrevOrNext(rowModel, 1, target);
            newParent = target.sibling ?? rootNode;
            target = found ?? null;
        }
        if (target?.detail) {
            // Detail row, we chose the master row instead.
            target = target.parent;
        }
        rowsDrop.moved &&= source !== target;

        let yDelta = 0.5;
        if (target) {
            if (sameGrid && rowsDrop.moved && (newParent || !canSetParent)) {
                yDelta = source.rowIndex! > target.rowIndex! ? -0.5 : 0.5; // Flat same grid row dragging - use row index
            } else {
                yDelta = (rowsDrop.y - target.rowTop! - target.rowHeight! / 2) / target.rowHeight! || 0; // Use relative mouse position
            }
        }

        if (!canSetParent && sameGrid && target && rowsDrop.moved && _isClientSideRowModel(gos)) {
            const newTarget = deltaDraggingTarget(rowModel, rowsDrop);
            if (newTarget) {
                yDelta = source.rowIndex! > newTarget.rowIndex! ? -0.5 : 0.5;
                target = newTarget;
                rowsDrop.moved &&= source !== target;
            }
        }

        const nudger = this.nudger;
        nudger?.updateGroup(target, moving);

        if (canSetParent && !newParent && nudger) {
            if (!target || (yDelta >= 0.5 && target.rowIndex === beans.pageBounds.getLastRow())) {
                newParent = rootNode; // Dragging outside of the rows, move to last row at the root level
            } else if (rowsDrop.moved && this.targetShouldBeParent(target, yDelta, rows)) {
                if (nudger.groupThrottled) {
                    newParent = target;
                }
                if (!moving && (!newParent || (target && !target.expanded && !!target.childrenAfterSort?.length))) {
                    nudger.startGroup(target);
                }
            }
            newParent ??= target?.parent ?? rootNode;
        }

        let inside = false;
        if (newParent) {
            if (newParent === target && newParent !== rootNode) {
                const firstRow = newParent.expanded ? getPrevOrNext(rowModel, 1, target) : null;
                if (firstRow?.parent === newParent) {
                    target = firstRow; // Instead of showing "inside" style, we can show "above" by using first child as target
                    yDelta = -0.5;
                } else {
                    inside = true; // Dragging as child
                }
            }

            if (target && !inside) {
                // Set target to the first group that is not the root node or the new parent
                let current: IRowNode | null = target;
                while (current && current !== rootNode && current !== newParent) {
                    target = current;
                    current = current.parent;
                }
            }
        }

        rowsDrop.target = target;
        rowsDrop.newParent = newParent;
        rowsDrop.moved &&= source !== target;

        const aboveOrBelow: 'above' | 'below' = yDelta < 0 ? 'above' : 'below';
        rowsDrop.position = rowsDrop.moved ? (inside ? 'inside' : aboveOrBelow) : 'none';

        this.validateRowsDrop(rowsDrop, canSetParent, aboveOrBelow, dropping);

        draggingEvent.changed ||= rowsDropChanged(lastDraggingEvent?.dropTarget, rowsDrop);

        return rowsDrop;
    }

    private newRowsDrop(draggingEvent: RowDraggingEvent, dropping: boolean): RowsDrop | null {
        const { beans, gos } = this;
        const rootNode = beans.rowModel.rootNode;
        const rowDragManaged = _isClientSideRowModel(gos) ? gos.get('rowDragManaged') : false;
        const suppressMoveWhenRowDragging = gos.get('suppressMoveWhenRowDragging');
        const sameGrid = this.isFromThisGrid(draggingEvent);
        let { rowNode: source, rowNodes: rows } = draggingEvent.dragItem;
        rows ||= source ? [source] : [];
        source ||= rows[0];
        if (!source || !rootNode) {
            return null;
        }

        const withinGrid = this.beans.dragAndDrop!.isDropZoneWithinThisGrid(draggingEvent);

        let allowed = true;
        if (
            rowDragManaged &&
            (!rows.length || this.shouldPreventRowMove() || ((suppressMoveWhenRowDragging || !sameGrid) && !withinGrid))
        ) {
            allowed = false;
        }

        const y = _getNormalisedMousePosition(beans, draggingEvent).y;
        const overNode = this.getOverNode(y);
        return {
            api: beans.gridApi,
            context: beans.gridOptions.context,
            draggingEvent,
            rowDragManaged,
            suppressMoveWhenRowDragging,
            sameGrid,
            withinGrid,
            rootNode,
            moved: source !== overNode,
            y,
            overNode: overNode,
            overIndex: overNode?.rowIndex ?? -1,
            position: 'none',
            source,
            target: overNode ?? null,
            newParent: null,
            rows,
            allowed,
            highlight: !dropping && rowDragManaged && suppressMoveWhenRowDragging && (withinGrid || !sameGrid),
        };
    }

    private validateRowsDrop(
        rowsDrop: RowsDrop,
        canSetParent: boolean,
        aboveOrBelow: 'above' | 'below',
        dropping: boolean
    ): void {
        const { rowDragManaged, suppressMoveWhenRowDragging } = rowsDrop;
        if (!canSetParent) {
            rowsDrop.newParent = null;
        }
        if (suppressMoveWhenRowDragging && !rowsDrop.moved) {
            rowsDrop.allowed = false;
        }
        const isRowValidDropPosition = (!rowDragManaged || rowsDrop.allowed) && this.gos.get('isRowValidDropPosition');
        if (isRowValidDropPosition) {
            if (canSetParent && rowsDrop.newParent && rowsHaveSameParent(rowsDrop.rows, rowsDrop.newParent)) {
                rowsDrop.newParent = null; // No need to set parent if all rows have the same parent
            }
            const canDropResult = isRowValidDropPosition(rowsDrop);
            if (!canDropResult) {
                rowsDrop.allowed = false; // No rows to drop
            } else if (typeof canDropResult === 'object') {
                // Custom result, override the default values
                if (canDropResult.rows !== undefined) {
                    rowsDrop.rows = canDropResult.rows ?? [];
                }
                if (canSetParent && canDropResult.newParent !== undefined) {
                    rowsDrop.newParent = canDropResult.newParent;
                }
                if (canDropResult.target !== undefined) {
                    rowsDrop.target = canDropResult.target;
                }
                if (canDropResult.position) {
                    rowsDrop.position = canDropResult.position;
                }
                if (canDropResult.allowed !== undefined) {
                    rowsDrop.allowed = canDropResult.allowed;
                } else if (!rowDragManaged) {
                    rowsDrop.allowed = true; // If not managed, we always allow the drop if it was not explicitly disallowed
                }
                const draggingEvent = rowsDrop.draggingEvent;
                if (canDropResult.changed && draggingEvent) {
                    draggingEvent.changed = true;
                }
                if (!dropping && canDropResult.highlight !== undefined) {
                    rowsDrop.highlight = canDropResult.highlight;
                }
            }
        }
        if (rowDragManaged) {
            rowsDrop.rows = this.filterRows(rowsDrop);
        }
        if (canSetParent && rowsDrop.newParent && rowsHaveSameParent(rowsDrop.rows, rowsDrop.newParent)) {
            rowsDrop.newParent = null; // No need to set parent if all rows have the same parent
        }
        if (suppressMoveWhenRowDragging && (!rowsDrop.rows.length || rowsDrop.position === 'none')) {
            rowsDrop.allowed = false;
        }
        if ((!rowsDrop.allowed || !rowsDrop.newParent) && rowsDrop.position === 'inside') {
            rowsDrop.position = aboveOrBelow; // Remove 'inside' if no new parent
        }
    }

    private targetShouldBeParent(target: IRowNode, yDelta: number, rows: IRowNode[]): boolean {
        const targetRowIndex = target.rowIndex!;

        const INSIDE_THRESHOLD = 0.25;

        if (yDelta < -0.5 + INSIDE_THRESHOLD) {
            return false; // Definitely above
        }
        if (yDelta < 0.5 - INSIDE_THRESHOLD) {
            return true; // Definitely inside
        }

        let nextRow: RowNode | undefined;
        let nextRowIndex = targetRowIndex + 1;
        const rowModel = this.beans.rowModel;
        do {
            nextRow = rowModel.getRow(nextRowIndex++);
        } while (nextRow?.footer);

        const childrenAfterGroup = target.childrenAfterGroup;
        if (nextRow && nextRow.parent === target && childrenAfterGroup?.length) {
            const rowsSet = new Set(rows);
            for (const child of childrenAfterGroup) {
                if (child.rowIndex !== null && !rowsSet.has(child)) {
                    return true; // The group has children, so we can move inside
                }
            }
        }

        return false;
    }

    public addRowDropZone(params: RowDropZoneParams & { fromGrid?: boolean }): void {
        if (!params.getContainer()) {
            _warn(55);
            return;
        }

        const dragAndDrop = this.beans.dragAndDrop!;
        if (dragAndDrop.findExternalZone(params.getContainer())) {
            _warn(56);
            return;
        }

        const processedParams: RowDropZoneParams = params.fromGrid
            ? params
            : {
                  getContainer: params.getContainer,
                  onDragEnter:
                      params.onDragEnter && ((e) => params.onDragEnter!(this.rowDragEvent('rowDragEnter', e as any))),
                  onDragLeave:
                      params.onDragLeave && ((e) => params.onDragLeave!(this.rowDragEvent('rowDragLeave', e as any))),
                  onDragging:
                      params.onDragging && ((e) => params.onDragging!(this.rowDragEvent('rowDragMove', e as any))),
                  onDragStop:
                      params.onDragStop && ((e) => params.onDragStop!(this.rowDragEvent('rowDragEnd', e as any))),
                  onDragCancel:
                      params.onDragCancel &&
                      ((e) => params.onDragCancel!(this.rowDragEvent('rowDragCancel', e as any))),
              };

        const dropTarget: DropTarget = {
            isInterestedIn: (type: DragSourceType) => type === DragSourceType.RowDrag,
            getIconName: () => 'move',
            external: true,
            ...(processedParams as any),
        };
        dragAndDrop.addDropTarget(dropTarget);
        this.addDestroyFunc(() => dragAndDrop.removeDropTarget(dropTarget));
    }

    public getRowDropZone(events?: RowDropZoneEvents): RowDropZoneParams {
        const result: InternalRowDropZoneParams = {
            getContainer: this.getContainer.bind(this),
            onDragEnter: (e) => {
                this.onDragEnter(e);
                events?.onDragEnter?.(this.rowDragEvent('rowDragEnter', e));
            },
            onDragLeave: (e) => {
                this.onDragLeave(e);
                events?.onDragLeave?.(this.rowDragEvent('rowDragLeave', e));
            },
            onDragging: (e) => {
                this.onDragging(e);
                events?.onDragging?.(this.rowDragEvent('rowDragMove', e));
            },
            onDragStop: (e) => {
                this.onDragStop(e);
                events?.onDragStop?.(this.rowDragEvent('rowDragEnd', e));
            },
            onDragCancel: (e) => {
                this.onDragCancel(e);
                events?.onDragCancel?.(this.rowDragEvent('rowDragCancel', e));
            },
            fromGrid: true /* @private */,
        };
        return result as RowDropZoneParams; // Cast to hide the internal properties
    }

    private getOverNode(y: number): RowNode | undefined {
        const { pageBounds, rowModel } = this.beans;
        const mouseIsPastLastRow = y > pageBounds.getCurrentPagePixelRange().pageLastPixel;
        const overIndex = mouseIsPastLastRow ? -1 : rowModel.getRowIndexAtPixel(y);
        return overIndex >= 0 ? rowModel.getRow(overIndex) : undefined;
    }

    private rowDragEvent<T extends RowDragEventType>(
        type: T,
        draggingEvent: RowDraggingEvent
    ): RowDragEvent<any, any, T> {
        const beans = this.beans;
        const { dragItem, dropTarget: rowsDrop, event, vDirection } = draggingEvent;
        const withRowsDrop = rowsDrop?.rootNode === beans.rowModel.rootNode;
        const y = withRowsDrop ? rowsDrop.y : _getNormalisedMousePosition(beans, draggingEvent).y;
        const overNode = withRowsDrop ? rowsDrop.overNode : this.getOverNode(y);
        const overIndex = withRowsDrop ? rowsDrop.overIndex : overNode?.rowIndex ?? -1;
        return {
            api: beans.gridApi,
            context: beans.gridOptions.context,
            type,
            event,
            node: dragItem.rowNode!,
            nodes: dragItem.rowNodes!,
            overIndex,
            overNode,
            y,
            vDirection,
            rowsDrop,
        };
    }

    private dispatchGridEvent(type: RowDragEventType, draggingEvent: RowDraggingEvent): void {
        const event = this.rowDragEvent(type, draggingEvent);
        this.eventSvc.dispatchEvent(event);
    }

    public onDragLeave(draggingEvent: RowDraggingEvent): void {
        this.dispatchGridEvent('rowDragLeave', draggingEvent);
        this.stopDragging(draggingEvent);
    }

    public onDragStop(draggingEvent: RowDraggingEvent): void {
        const rowsDrop = this.makeRowsDrop(this.lastDraggingEvent, draggingEvent, false, true);
        this.dispatchGridEvent('rowDragEnd', draggingEvent);
        if (
            rowsDrop?.allowed &&
            rowsDrop.rowDragManaged &&
            (rowsDrop.suppressMoveWhenRowDragging || !rowsDrop.sameGrid || this.nudger?.autoScroll.scrolling)
        ) {
            this.dropRows(rowsDrop); // Drop the rows after dragging
        }
        this.stopDragging(draggingEvent);
    }

    public onDragCancel(draggingEvent: RowDraggingEvent): void {
        this.dispatchGridEvent('rowDragCancel', draggingEvent);
        this.stopDragging(draggingEvent);
    }

    private stopDragging(draggingEvent: RowDraggingEvent): void {
        this.nudger?.clear();
        this.beans.rowDropHighlightSvc?.fromDrag(null);
        setRowNodesDragging(draggingEvent.dragItem.rowNodes, false);
    }

    /** Drag and drop. Returns false if at least a row was moved, otherwise true */
    private dropRows(rowsDrop: RowsDrop): boolean {
        return rowsDrop.sameGrid ? this.csrmMoveRows(rowsDrop) : this.csrmAddRows(rowsDrop);
    }

    private csrmAddRows({ position, target, rows }: RowsDrop): boolean {
        const getRowIdFunc = _getRowIdCallback(this.gos);
        const clientSideRowModel = this.beans.rowModel as IClientSideRowModel;

        const add = rows
            .filter(
                ({ data, rowPinned }) =>
                    !clientSideRowModel.getRowNode(getRowIdFunc?.({ data, level: 0, rowPinned }) ?? data.id)
            )
            .map(({ data }) => data);

        if (add.length === 0) {
            return false; // Nothing to add
        }

        const addIndex = target ? getLeafSourceRowIndex(target) + (position === 'above' ? 0 : 1) : undefined;
        clientSideRowModel.updateRowData({ add, addIndex });

        return true;
    }

    private filterRows({ newParent, rows }: RowsDrop): IRowNode[] {
        let filtered: IRowNode[] | undefined;
        for (let i = 0, len = rows.length; i < len; ++i) {
            let valid = true;

            const row = rows[i];
            if (
                !row ||
                row.footer ||
                (row.rowTop === null && row !== this.beans.rowModel.getRowNode(row.id!)) || // This row cannot be dragged, not in allLeafChildren and not a filler
                (newParent && row.parent !== newParent && wouldFormCycle(row, newParent)) || // Cannot move to a parent that would create a cycle
                !getLeafRow(row) // No leaf to move, so nothing to do
            ) {
                valid = false;
            }

            if (valid) {
                filtered?.push(row);
            } else {
                filtered ??= rows.slice(0, i); // Lazy initialization of the filtered array
            }
        }
        return filtered ?? rows; // If all rows are valid, return the original array
    }

    private csrmMoveRows({ position, target, rows, newParent, rootNode }: RowsDrop): boolean {
        let changed = false;

        const leafs = new Set<RowNode>();
        for (const row of rows as RowNode[]) {
            if (newParent && row.parent !== newParent) {
                row.treeParent = newParent as RowNode;
                changed = true;
            }

            const leafRow = getLeafRow(row);
            if (leafRow) {
                leafs.add(leafRow);
            }
        }

        if (!changed && leafs.size === 0) {
            return false; // Nothing to move
        }

        // Get the focussed cell so we can ensure it remains focussed after the move
        const focusSvc = this.beans.focusSvc;
        const cellPosition = focusSvc.getFocusedCell();
        const cellCtrl = cellPosition && _getCellByPosition(this.beans, cellPosition);

        if (
            leafs.size &&
            this.reorderLeafChildren(leafs, ...this.getMoveRowsBounds(leafs, target, position === 'above'))
        ) {
            changed = true;
        }

        if (!changed) {
            return false;
        }

        const clientSideRowModel = this.beans.rowModel as IClientSideRowModel;
        const changedRowNodes = new ChangedRowNodes();
        changedRowNodes.reordered = true;
        clientSideRowModel.refreshModel({
            step: 'group',
            keepRenderedRows: true,
            animate: !this.gos.get('suppressAnimationFrame'),
            changedPath: new ChangedPath(false, rootNode as RowNode),
            changedRowNodes,
        });

        // Get the focussed cell so we can ensure it remains focussed after the move
        if (cellCtrl) {
            cellCtrl.focusCell();
        } else {
            focusSvc.clearFocusedCell();
        }
        return true;
    }

    /** For reorderLeafChildren, returns min index of the rows to move, the target index and the max index of the rows to move. */
    private getMoveRowsBounds(leafs: Iterable<RowNode>, target: IRowNode | null | undefined, above: boolean) {
        const totalRows = this.beans.rowModel.rootNode?._leafs?.length ?? 0;
        let targetPositionIdx = target ? getLeafSourceRowIndex(target) : -1;
        if (targetPositionIdx < 0 || targetPositionIdx >= totalRows) {
            targetPositionIdx = totalRows;
        } else if (!above) {
            ++targetPositionIdx;
        }
        let firstAffectedLeafIdx = targetPositionIdx;
        let lastAffectedLeafIndex = Math.min(targetPositionIdx, totalRows - 1);
        for (const row of leafs) {
            const sourceRowIndex = row.sourceRowIndex;
            if (sourceRowIndex < firstAffectedLeafIdx) {
                firstAffectedLeafIdx = sourceRowIndex;
            }
            if (sourceRowIndex > lastAffectedLeafIndex) {
                lastAffectedLeafIndex = sourceRowIndex;
            }
        }
        return [firstAffectedLeafIdx, targetPositionIdx, lastAffectedLeafIndex] as const;
    }

    /** Reorders the children of the root node, so that the rows to move are in the correct order.
     * @param leafs The valid set of rows to move, as returned by getValidRowsToMove
     * @param firstAffectedLeafIdx The first index of the rows to move
     * @param targetPositionIdx The target index, where the rows will be moved
     * @param lastAffectedLeafIndex The last index of the rows to move
     * @returns True if the order of the rows changed, false otherwise
     */
    private reorderLeafChildren(
        leafs: ReadonlySet<RowNode>,
        firstAffectedLeafIdx: number,
        targetPositionIdx: number,
        lastAffectedLeafIndex: number
    ): boolean {
        let orderChanged = false;

        const allLeafs: RowNode[] | null | undefined = this.beans.rowModel.rootNode?._leafs;
        if (!leafs.size || !allLeafs) {
            return false;
        }

        // First partition. Filter from left to right, so the middle can be overwritten
        let writeIdxLeft = firstAffectedLeafIdx;
        for (let readIdx = firstAffectedLeafIdx; readIdx < targetPositionIdx; ++readIdx) {
            const row = allLeafs[readIdx];
            if (!leafs.has(row)) {
                if (row.sourceRowIndex !== writeIdxLeft) {
                    row.sourceRowIndex = writeIdxLeft;
                    allLeafs[writeIdxLeft] = row;
                    orderChanged = true;
                }
                ++writeIdxLeft;
            }
        }

        // Third partition. Filter from right to left, so the middle can be overwritten
        let writeIdxRight = lastAffectedLeafIndex;
        for (let readIdx = lastAffectedLeafIndex; readIdx >= targetPositionIdx; --readIdx) {
            const row = allLeafs[readIdx];
            if (!leafs.has(row)) {
                if (row.sourceRowIndex !== writeIdxRight) {
                    row.sourceRowIndex = writeIdxRight;
                    allLeafs[writeIdxRight] = row;
                    orderChanged = true;
                }
                --writeIdxRight;
            }
        }

        // Second partition. Overwrites the middle between the other two filtered partitions
        for (const row of leafs) {
            if (row.sourceRowIndex !== writeIdxLeft) {
                row.sourceRowIndex = writeIdxLeft;
                allLeafs[writeIdxLeft] = row;
                orderChanged = true;
            }
            ++writeIdxLeft;
        }

        return orderChanged;
    }
}

/** When dragging multiple rows, we want the user to be able to drag to the prev or next in the group if dragging on one of the selected rows. */
const getPrevOrNext = (
    rowModel: IRowModel,
    direction: -1 | 1,
    initial: IRowNode | null | undefined
): RowNode | undefined => {
    if (initial) {
        const rowCount = rowModel.getRowCount();
        let rowIndex = initial.rowIndex! + direction;
        while (rowIndex >= 0 && rowIndex < rowCount) {
            const row: RowNode | undefined = rowModel.getRow(rowIndex);
            if (!row || (!row.footer && !row.detail)) {
                return row;
            }
            rowIndex += direction;
        }
    }
    return undefined; // Out of bounds
};

const wouldFormCycle = <TData>(row: IRowNode<TData>, newParent: IRowNode<TData> | null): boolean => {
    let parent = newParent;
    while (parent) {
        if (parent === row) {
            return true;
        }
        parent = parent.parent;
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

const getLeafSourceRowIndex = (row: IRowNode): number => {
    const leaf = getLeafRow(row);
    return leaf !== undefined ? leaf.sourceRowIndex : -1;
};

const getLeafRow = (row: IRowNode): RowNode | undefined =>
    row.data ? (row as RowNode) : _firstLeaf(row.childrenAfterGroup);

const rowsDropChanged = (a: RowsDrop | null | undefined, b: RowsDrop): boolean =>
    a !== b &&
    (!a ||
        a.sameGrid !== b.sameGrid ||
        a.allowed !== b.allowed ||
        a.position !== b.position ||
        a.target !== b.target ||
        a.source !== b.source ||
        a.newParent !== b.newParent ||
        !_areEqual(a.rows, b.rows));

const compareRowIndex = ({ rowIndex: a }: IRowNode, { rowIndex: b }: IRowNode): number =>
    a !== null && b !== null ? a - b : 0;

const setRowNodesDragging = (rowNodes: IRowNode[] | null | undefined, dragging: boolean): void => {
    for (let i = 0, len = rowNodes?.length || 0; i < len; ++i) {
        const rowNode = rowNodes![i] as RowNode;
        if (rowNode.dragging !== dragging) {
            rowNode.dragging = dragging;
            rowNode.dispatchRowEvent('draggingChanged');
        }
    }
};

const deltaDraggingTarget = (rowModel: IRowModel, rowsDrop: RowsDrop): RowNode | null => {
    let bestTarget = null;
    let current = rowsDrop.target;
    if (current && rowsDrop.rows.indexOf(current) < 0) {
        return null;
    }
    const source = rowsDrop.source;
    if (!current || !source) {
        return null;
    }
    let count = current.rowIndex! - source.rowIndex!;
    const increment = count < 0 ? -1 : 1;
    count = rowsDrop.suppressMoveWhenRowDragging ? Math.abs(count) : 1;
    const rowsSet = new Set(rowsDrop.rows);
    do {
        const candidate = getPrevOrNext(rowModel, increment, current);
        if (!candidate) {
            break;
        }
        if (!rowsSet.has(candidate)) {
            bestTarget = candidate;
            --count;
        }
        current = candidate;
    } while (count > 0);
    return bestTarget;
};
