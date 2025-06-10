import { AutoScrollService } from '../autoScrollService';
import { BeanStub } from '../context/beanStub';
import { _getCellByPosition } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import type {
    RowDragCancelEvent,
    RowDragEndEvent,
    RowDragEnterEvent,
    RowDragEvent,
    RowDragLeaveEvent,
    RowDragMoveEvent,
} from '../events';
import { _getNormalisedMousePosition } from '../gridBodyComp/mouseEventUtils';
import {
    _addGridCommonParams,
    _getGroupingApproach,
    _getRowIdCallback,
    _isClientSideRowModel,
} from '../gridOptionsUtils';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IRowNode } from '../interfaces/iRowNode';
import { _last } from '../utils/array';
import { ChangedPath } from '../utils/changedPath';
import { _warn } from '../validation/logging';
import type { DragAndDropIcon, DraggingEvent, DropTarget } from './dragAndDropService';
import { DragSourceType } from './dragAndDropService';

export interface RowDropZoneEvents {
    /** Callback function that will be executed when the rowDrag enters the target. */
    onDragEnter?: (params: RowDragEnterEvent) => void;
    /** Callback function that will be executed when the rowDrag leaves the target */
    onDragLeave?: (params: RowDragLeaveEvent) => void;
    /**
     * Callback function that will be executed when the rowDrag is dragged inside the target.
     * Note: this gets called multiple times.
     */
    onDragging?: (params: RowDragMoveEvent) => void;
    /** Callback function that will be executed when the rowDrag drops rows within the target. */
    onDragStop?: (params: RowDragEndEvent) => void;
    onDragCancel?: (params: RowDragCancelEvent) => void;
}

interface WritableRowNode extends RowNode {
    treeParent: RowNode | null;
    sourceRowIndex: number;
}

/** We actually have a different interface if we are passing params out of the grid and
 * directly into another grid. These internal params just work directly off the DraggingEvent.
 * However, we don't want to expose these to the user, so we have a different interface for
 * them called RowDropZoneParams which works with RowDragEvents.
 */
interface InternalRowDropZoneEvents {
    /** Callback function that will be executed when the rowDrag enters the target. */
    onDragEnter?: (params: DraggingEvent) => void;
    /** Callback function that will be executed when the rowDrag leaves the target */
    onDragLeave?: (params: DraggingEvent) => void;
    /**
     * Callback function that will be executed when the rowDrag is dragged inside the target.
     * Note: this gets called multiple times.
     */
    onDragging?: (params: DraggingEvent) => void;
    /** Callback function that will be executed when the rowDrag drops rows within the target. */
    onDragStop?: (params: DraggingEvent) => void;
    onDragCancel?: (params: DraggingEvent) => void;
}
interface InternalRowDropZoneParams extends InternalRowDropZoneEvents {
    /** A callback method that returns the DropZone HTMLElement. */
    getContainer: () => HTMLElement;
    /** internal flag for identifying params from the grid. */
    fromGrid?: boolean;
}

export interface RowDropZoneParams extends RowDropZoneEvents {
    /** A callback method that returns the DropZone HTMLElement. */
    getContainer: () => HTMLElement;
}

interface RowsDrop<TData = any> {
    sameGrid: boolean;
    above: boolean;
    target: RowNode<TData> | null;
    newParent: RowNode<TData> | null;
    rows: IRowNode<TData>[];
}

type RowDragEventType = 'rowDragEnter' | 'rowDragLeave' | 'rowDragMove' | 'rowDragEnd' | 'rowDragCancel';

export class RowDragFeature extends BeanStub implements DropTarget {
    private clientSideRowModel: IClientSideRowModel;
    private eContainer: HTMLElement;
    private lastDraggingEvent: DraggingEvent;
    private autoScrollService: AutoScrollService;

    constructor(eContainer: HTMLElement) {
        super();
        this.eContainer = eContainer;
    }

    public postConstruct(): void {
        const { rowModel, gos, ctrlsSvc } = this.beans;
        if (_isClientSideRowModel(gos, rowModel)) {
            this.clientSideRowModel = rowModel;
        }

        ctrlsSvc.whenReady(this, (p) => {
            const gridBodyCon = p.gridBodyCtrl;
            this.autoScrollService = new AutoScrollService({
                scrollContainer: gridBodyCon.eBodyViewport,
                scrollAxis: 'y',
                getVerticalPosition: () => gridBodyCon.scrollFeature.getVScrollPosition().top,
                setVerticalPosition: (position) => gridBodyCon.scrollFeature.setVerticalScrollPosition(position),
                onScrollCallback: () => {
                    this.onDragging(this.lastDraggingEvent);
                },
            });
        });
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

    public isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.RowDrag;
    }

    public getIconName(): DragAndDropIcon {
        const managedDrag = this.gos.get('rowDragManaged');

        if (managedDrag && this.shouldPreventRowMove()) {
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

    private getRowNodes(draggingEvent: DraggingEvent): RowNode[] {
        if (!this.isFromThisGrid(draggingEvent)) {
            return (draggingEvent.dragItem.rowNodes || []) as RowNode[];
        }

        const currentNode = draggingEvent.dragItem.rowNode! as RowNode;
        const isRowDragMultiRow = this.gos.get('rowDragMultiRow');
        if (isRowDragMultiRow) {
            const selectedNodes = [...(this.beans.selectionSvc?.getSelectedNodes() ?? [])].sort((a, b) => {
                if (a.rowIndex == null || b.rowIndex == null) {
                    return 0;
                }

                return this.getRowIndexNumber(a) - this.getRowIndexNumber(b);
            });
            if (selectedNodes.indexOf(currentNode) !== -1) {
                return selectedNodes;
            }
        }

        return [currentNode];
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        // builds a lits of all rows being dragged before firing events
        draggingEvent.dragItem.rowNodes = this.getRowNodes(draggingEvent);

        // when entering, we fire the enter event, then in onEnterOrDragging,
        // we also fire the move event. so we get both events when entering.
        this.dispatchGridEvent('rowDragEnter', draggingEvent);

        this.getRowNodes(draggingEvent).forEach((rowNode) => {
            this.setRowNodeDragging(rowNode, true);
        });

        this.onEnterOrDragging(draggingEvent);
    }

    public onDragging(draggingEvent: DraggingEvent): void {
        this.onEnterOrDragging(draggingEvent);
    }

    private isFromThisGrid(draggingEvent: DraggingEvent) {
        const { dragSourceDomDataKey } = draggingEvent.dragSource;

        return dragSourceDomDataKey === this.gos.getDomDataKey();
    }

    private onEnterOrDragging(draggingEvent: DraggingEvent): void {
        // this event is fired for enter and move
        this.dispatchGridEvent('rowDragMove', draggingEvent);

        this.lastDraggingEvent = draggingEvent;

        if (this.gos.get('rowDragManaged')) {
            this.doManagedDrag(draggingEvent);
        }

        this.autoScrollService.check(draggingEvent.event);
    }

    private doManagedDrag(draggingEvent: DraggingEvent): void {
        const { dragAndDrop, gos } = this.beans;
        const isFromThisGrid = this.isFromThisGrid(draggingEvent);
        const managedDrag = gos.get('rowDragManaged');

        if (managedDrag && this.shouldPreventRowMove()) {
            return;
        }

        if (gos.get('suppressMoveWhenRowDragging') || !isFromThisGrid) {
            if (dragAndDrop!.isDropZoneWithinThisGrid(draggingEvent)) {
                const rowsDrop = this.getRowsDrop(draggingEvent);
                const target = rowsDrop?.target;
                const rowDropHighlightSvc = this.beans.rowDropHighlightSvc!;
                if (target) {
                    rowDropHighlightSvc.set(target, rowsDrop.above ? 'above' : 'below');
                } else {
                    rowDropHighlightSvc.clear();
                }
            }
        } else {
            const rowsDrop = this.getRowsDrop(draggingEvent);
            if (rowsDrop) {
                this.dropRows(rowsDrop);
            }
        }
    }

    private getRowIndexNumber(rowNode: RowNode): number {
        const rowIndexStr = rowNode.getRowIndexString()!;

        return parseInt(_last(rowIndexStr.split('-')), 10);
    }

    private getRowsDrop(draggingEvent: DraggingEvent): RowsDrop | null {
        const { rowNode, rowNodes: rows } = draggingEvent.dragItem;
        const rowsLen = rows?.length;
        const source = rowsLen && (rowNode ?? rows[0]);

        if (!source) {
            return null; // Nothing to move
        }

        const { beans, gos, clientSideRowModel } = this;
        const y = _getNormalisedMousePosition(beans, draggingEvent).y;
        let targetRowIndex = clientSideRowModel.getRowIndexAtPixel(y);
        let target = clientSideRowModel.getRow(targetRowIndex) ?? null;

        const yDelta = target ? (y - target.rowTop! - target.rowHeight! / 2) / target.rowHeight! || 0 : 1;
        let above = yDelta < 0;

        const sameGrid = this.isFromThisGrid(draggingEvent);

        const groupingApproach = _getGroupingApproach(gos);
        const canSetParent =
            // We don't yet support drag and drop with grouping
            groupingApproach !== 'group' &&
            // We don't yet support moving tree rows from a different grid in a structured way
            sameGrid;

        let targetInRows = false;

        if (sameGrid && target) {
            if (source === target) {
                targetInRows = true;
                if (Math.abs(yDelta) <= 1) {
                    return null; // Nothing to move
                }
            } else {
                targetInRows = rows.indexOf(target) >= 0;
                if (targetInRows) {
                    const newTarget = getRowsPrevOrNext(clientSideRowModel, targetRowIndex < source.rowIndex!, rows);
                    if (newTarget?.parent === target.parent) {
                        target = newTarget; // Delta dragging, the user moved to a selected row above or below
                        targetRowIndex = target.rowIndex!;
                    }
                }
            }

            if (targetInRows || (!canSetParent && Math.abs(targetRowIndex - source.rowIndex!) === 1)) {
                above = targetRowIndex < source.rowIndex!; // Select the row above or below without the mid point if the diff is 1
            }
        }

        let newParent = canSetParent ? this.determineNewParent(target, yDelta, targetInRows, rows) : null;
        if (newParent) {
            if (newParent === target) {
                above = false; // When moving inside the target, we want to insert below it
            }
            if (rowsHaveSameParent(rows, newParent)) {
                newParent = null; // No need to set parent if all rows have the same parent
            }
        }

        if (!newParent && targetInRows && (canSetParent || source === target)) {
            // No delta dragging of multiple rows with TreeData or no change, nothing to move
            return null;
        }

        return { sameGrid, above, target, newParent, rows };
    }

    private determineNewParent(
        target: RowNode | null,
        yDelta: number,
        targetInRows: boolean,
        rows: IRowNode[]
    ): RowNode | null {
        const { clientSideRowModel, beans } = this;
        const { pageBounds } = beans;
        const targetRowIndex = target?.rowIndex;
        if (!target || (yDelta > 1 && targetRowIndex === pageBounds.getLastRow())) {
            // Dragging outside of the rows, move to last row at the root level
            return clientSideRowModel.rootNode;
        }

        const INSIDE_THRESHOLD = 0.25;

        if (!targetInRows) {
            if (Math.abs(yDelta) < INSIDE_THRESHOLD) {
                return target; // Inside the middle of the row, we want to move inside, as children
            }
            if (
                yDelta >= INSIDE_THRESHOLD &&
                yDelta <= 1 &&
                clientSideRowModel.getRow(targetRowIndex! + 1)?.parent === target
            ) {
                const { childrenAfterAggFilter } = target;
                if (childrenAfterAggFilter) {
                    let hasMoreChildren = false;
                    const rowsSet = new Set(rows);
                    for (const child of childrenAfterAggFilter) {
                        if (!rowsSet.has(child) && child.rowIndex !== null) {
                            hasMoreChildren = true;
                            break;
                        }
                    }
                    if (hasMoreChildren) {
                        return target; // In the bottom half of an expanded group with more than one child, we move inside the target
                    }
                }
            }
        }

        // Same parent as the target
        return target.parent;
    }

    public addRowDropZone(params: RowDropZoneParams & { fromGrid?: boolean }): void {
        if (!params.getContainer()) {
            _warn(55);
            return;
        }

        const dragAndDrop = this.beans.dragAndDrop!;
        if (dragAndDrop.findExternalZone(params)) {
            _warn(56);
            return;
        }

        let processedParams: RowDropZoneParams = {
            getContainer: params.getContainer,
        };

        if (params.fromGrid) {
            processedParams = params;
        } else {
            if (params.onDragEnter) {
                processedParams.onDragEnter = (e) => {
                    params.onDragEnter!(this.draggingToRowDragEvent('rowDragEnter', e as any));
                };
            }
            if (params.onDragLeave) {
                processedParams.onDragLeave = (e) => {
                    params.onDragLeave!(this.draggingToRowDragEvent('rowDragLeave', e as any));
                };
            }
            if (params.onDragging) {
                processedParams.onDragging = (e) => {
                    params.onDragging!(this.draggingToRowDragEvent('rowDragMove', e as any));
                };
            }
            if (params.onDragStop) {
                processedParams.onDragStop = (e) => {
                    params.onDragStop!(this.draggingToRowDragEvent('rowDragEnd', e as any));
                };
            }
            if (params.onDragCancel) {
                processedParams.onDragCancel = (e) => {
                    params.onDragCancel!(this.draggingToRowDragEvent('rowDragCancel', e as any));
                };
            }
        }

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
        const getContainer = this.getContainer.bind(this);
        const onDragEnter = this.onDragEnter.bind(this);
        const onDragLeave = this.onDragLeave.bind(this);
        const onDragging = this.onDragging.bind(this);
        const onDragStop = this.onDragStop.bind(this);
        const onDragCancel = this.onDragCancel.bind(this);

        let params: InternalRowDropZoneParams;
        if (!events) {
            params = {
                getContainer,
                onDragEnter,
                onDragLeave,
                onDragging,
                onDragStop,
                onDragCancel,
                /* @private */ fromGrid: true,
            };
        } else {
            params = {
                getContainer,
                onDragEnter: events.onDragEnter
                    ? (e) => {
                          onDragEnter(e);
                          events.onDragEnter!(this.draggingToRowDragEvent('rowDragEnter', e));
                      }
                    : onDragEnter,
                onDragLeave: events.onDragLeave
                    ? (e) => {
                          onDragLeave(e);
                          events.onDragLeave!(this.draggingToRowDragEvent('rowDragLeave', e));
                      }
                    : onDragLeave,
                onDragging: events.onDragging
                    ? (e) => {
                          onDragging(e);
                          events.onDragging!(this.draggingToRowDragEvent('rowDragMove', e));
                      }
                    : onDragging,
                onDragStop: events.onDragStop
                    ? (e) => {
                          onDragStop(e);
                          events.onDragStop!(this.draggingToRowDragEvent('rowDragEnd', e));
                      }
                    : onDragStop,
                onDragCancel: events.onDragCancel
                    ? (e) => {
                          onDragCancel(e);
                          events.onDragCancel!(this.draggingToRowDragEvent('rowDragCancel', e));
                      }
                    : onDragCancel,
                fromGrid: true /* @private */,
            };
        }
        // Cast to RowDropZoneParams to hide the internal properties
        return params as RowDropZoneParams;
    }

    private draggingToRowDragEvent<T extends RowDragEventType>(type: T, draggingEvent: DraggingEvent): RowDragEvent<T> {
        const beans = this.beans;
        const { pageBounds, rowModel, gos } = beans;
        const y = _getNormalisedMousePosition(this.beans, draggingEvent).y;
        const mouseIsPastLastRow = y > pageBounds.getCurrentPagePixelRange().pageLastPixel;

        let overIndex = -1;
        let overNode: RowNode | undefined;

        if (!mouseIsPastLastRow) {
            overIndex = rowModel.getRowIndexAtPixel(y);
            overNode = rowModel.getRow(overIndex);
        }

        const event: RowDragEvent<T> = _addGridCommonParams(gos, {
            type: type,
            event: draggingEvent.event,
            node: draggingEvent.dragItem.rowNode!,
            nodes: draggingEvent.dragItem.rowNodes!,
            overIndex: overIndex,
            overNode: overNode,
            y,
            vDirection: draggingEvent.vDirection,
        });

        return event;
    }

    private dispatchGridEvent(type: RowDragEventType, draggingEvent: DraggingEvent): void {
        const event = this.draggingToRowDragEvent(type, draggingEvent);

        this.eventSvc.dispatchEvent(event);
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        this.dispatchGridEvent('rowDragLeave', draggingEvent);
        this.stopDragging(draggingEvent);

        if (this.gos.get('rowDragManaged')) {
            this.beans.rowDropHighlightSvc!.clear();
        }
    }

    public onDragStop(draggingEvent: DraggingEvent): void {
        this.dispatchGridEvent('rowDragEnd', draggingEvent);
        this.stopDragging(draggingEvent);
        const { dragAndDrop, gos } = this.beans;

        if (
            gos.get('rowDragManaged') &&
            (gos.get('suppressMoveWhenRowDragging') || !this.isFromThisGrid(draggingEvent)) &&
            dragAndDrop!.isDropZoneWithinThisGrid(draggingEvent)
        ) {
            const rowsDrop = this.getRowsDrop(draggingEvent);
            if (rowsDrop) {
                this.dropRows(rowsDrop);
            }
            this.beans.rowDropHighlightSvc!.clear();
        }
    }

    public onDragCancel(draggingEvent: DraggingEvent): void {
        this.dispatchGridEvent('rowDragCancel', draggingEvent);
        this.stopDragging(draggingEvent);
        const { dragAndDrop, gos } = this.beans;

        if (
            gos.get('rowDragManaged') &&
            (gos.get('suppressMoveWhenRowDragging') || !this.isFromThisGrid(draggingEvent)) &&
            dragAndDrop!.isDropZoneWithinThisGrid(draggingEvent)
        ) {
            this.beans.rowDropHighlightSvc!.clear();
        }
    }

    private stopDragging(draggingEvent: DraggingEvent): void {
        this.autoScrollService.ensureCleared();

        this.getRowNodes(draggingEvent).forEach((rowNode) => {
            this.setRowNodeDragging(rowNode, false);
        });
    }

    private setRowNodeDragging(rowNode: RowNode, dragging: boolean): void {
        if (rowNode.dragging !== dragging) {
            rowNode.dragging = dragging;
            rowNode.dispatchRowEvent('draggingChanged');
        }
    }

    /** Drag and drop. Returns false if at least a row was moved, otherwise true */
    private dropRows(rowsDrop: RowsDrop): boolean {
        return rowsDrop.sameGrid ? this.moveRows(rowsDrop) : this.addRows(rowsDrop);
    }

    private addRows({ above, target, rows }: RowsDrop): boolean {
        const getRowIdFunc = _getRowIdCallback(this.gos);
        const clientSideRowModel = this.clientSideRowModel;

        const add = rows
            .filter(
                ({ data, rowPinned }) =>
                    !clientSideRowModel.getRowNode(getRowIdFunc?.({ data, level: 0, rowPinned }) ?? data.id)
            )
            .map(({ data }) => data);

        if (add.length === 0) {
            return false; // Nothing to add
        }

        const addIndex = target ? getLeafSourceRowIndex(target) + (above ? 0 : 1) : undefined;
        clientSideRowModel.updateRowData({ add, addIndex });

        return true;
    }

    private refreshModelAfterDrop(): void {
        this.clientSideRowModel.refreshModel({
            step: 'group',
            keepRenderedRows: true,
            animate: !this.gos.get('suppressAnimationFrame'),
            changedPath: new ChangedPath(false, this.clientSideRowModel.rootNode!),
            rowNodesOrderChanged: true,
        });
    }

    private moveRows({ above, target, rows, newParent }: RowsDrop): boolean {
        let changed = false;

        const clientSideRowModel = this.clientSideRowModel;
        const leafs = new Set<WritableRowNode>();
        for (const row of rows as WritableRowNode[]) {
            if (row.rowTop === null && row !== clientSideRowModel.getRowNode(row.id!)) {
                continue; // This row appears to have been removed
            }

            if (newParent && row.parent !== newParent) {
                if (wouldFormCycle(row, newParent)) {
                    continue; // Invalid move.
                }
                row.treeParent = newParent;
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

        if (leafs.size && this.reorderLeafChildren(leafs, ...this.getMoveRowsBounds(leafs, target, above))) {
            changed = true;
        }

        if (!changed) {
            return false;
        }

        this.refreshModelAfterDrop();

        // Get the focussed cell so we can ensure it remains focussed after the move
        if (cellCtrl) {
            cellCtrl.focusCell();
        } else {
            focusSvc.clearFocusedCell();
        }
        return true;
    }

    /** For reorderLeafChildren, returns min index of the rows to move, the target index and the max index of the rows to move. */
    private getMoveRowsBounds(leafs: Iterable<RowNode>, target: RowNode | null | undefined, above: boolean) {
        const totalRows = this.clientSideRowModel.rootNode?.allLeafChildren!.length ?? 0;
        let targetPositionIdx = getLeafSourceRowIndex(target);
        if (targetPositionIdx < 0 || targetPositionIdx >= totalRows) {
            targetPositionIdx = totalRows;
        } else if (!above) {
            ++targetPositionIdx;
        }
        let firstAffectedLeafIdx = targetPositionIdx;
        let lastAffectedLeafIndex = Math.min(targetPositionIdx, totalRows - 1);
        for (const row of leafs) {
            const sourceRowIndex = row.sourceRowIndex;
            if (sourceRowIndex < firstAffectedLeafIdx) firstAffectedLeafIdx = sourceRowIndex;
            if (sourceRowIndex > lastAffectedLeafIndex) lastAffectedLeafIndex = sourceRowIndex;
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
        leafs: ReadonlySet<WritableRowNode>,
        firstAffectedLeafIdx: number,
        targetPositionIdx: number,
        lastAffectedLeafIndex: number
    ): boolean {
        let orderChanged = false;

        const allLeafChildren: WritableRowNode[] | null | undefined = this.clientSideRowModel.rootNode?.allLeafChildren;
        if (!leafs.size || !allLeafChildren) {
            return false;
        }

        // First partition. Filter from left to right, so the middle can be overwritten
        let writeIdxLeft = firstAffectedLeafIdx;
        for (let readIdx = firstAffectedLeafIdx; readIdx < targetPositionIdx; ++readIdx) {
            const row = allLeafChildren[readIdx];
            if (!leafs.has(row)) {
                if (row.sourceRowIndex !== writeIdxLeft) {
                    row.sourceRowIndex = writeIdxLeft;
                    allLeafChildren[writeIdxLeft] = row;
                    orderChanged = true;
                }
                ++writeIdxLeft;
            }
        }

        // Third partition. Filter from right to left, so the middle can be overwritten
        let writeIdxRight = lastAffectedLeafIndex;
        for (let readIdx = lastAffectedLeafIndex; readIdx >= targetPositionIdx; --readIdx) {
            const row = allLeafChildren[readIdx];
            if (!leafs.has(row)) {
                if (row.sourceRowIndex !== writeIdxRight) {
                    row.sourceRowIndex = writeIdxRight;
                    allLeafChildren[writeIdxRight] = row;
                    orderChanged = true;
                }
                --writeIdxRight;
            }
        }

        // Second partition. Overwrites the middle between the other two filtered partitions
        for (const row of leafs) {
            if (row.sourceRowIndex !== writeIdxLeft) {
                row.sourceRowIndex = writeIdxLeft;
                allLeafChildren[writeIdxLeft] = row;
                orderChanged = true;
            }
            ++writeIdxLeft;
        }

        return orderChanged;
    }
}

const getRowsPrevOrNext = (
    clientSideRowModel: IClientSideRowModel,
    above: boolean,
    rows: IRowNode[]
): RowNode | undefined => {
    return above ? getPrevOrNext(clientSideRowModel, -1, rows[0]) : getPrevOrNext(clientSideRowModel, 1, _last(rows));
};

/** When dragging multiple rows, we want the user to be able to drag to the prev or next in the group if dragging on one of the selected rows. */
const getPrevOrNext = (
    clientSideRowModel: IClientSideRowModel,
    increment: -1 | 1,
    initialRow: IRowNode
): RowNode | undefined => {
    const rowCount = clientSideRowModel.getRowCount();
    let rowIndex = initialRow.rowIndex! + increment;
    while (rowIndex >= 0 && rowIndex < rowCount) {
        const row = clientSideRowModel.getRow(rowIndex)!;
        if (row.sourceRowIndex >= 0) {
            return row; // Valid leaf node
        }
        rowIndex += increment;
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

const rowsHaveSameParent = (rows: IRowNode<any>[], newParent: RowNode): boolean => {
    for (let i = 0, len = rows.length; i < len; ++i) {
        if (rows[i].parent !== newParent) {
            return false;
        }
    }
    return true;
};

const getLeafSourceRowIndex = (row: WritableRowNode | null | undefined): number => {
    const leaf = getLeafRow(row);
    return leaf !== undefined ? leaf.sourceRowIndex : -1;
};

const getLeafRow = (row: WritableRowNode | null | undefined): WritableRowNode | undefined => {
    while (row) {
        if (row.sourceRowIndex >= 0) {
            return row;
        }
        const childrenAfterGroup = row.childrenAfterGroup;
        if (!childrenAfterGroup?.length) {
            return undefined;
        }
        row = childrenAfterGroup[0];
    }
};
