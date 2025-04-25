import { AutoScrollService } from '../autoScrollService';
import { BeanStub } from '../context/beanStub';
import { _getCellByPosition } from '../entities/positionUtils';
import type { RowHighlightPosition, RowNode } from '../entities/rowNode';
import type {
    RowDragCancelEvent,
    RowDragEndEvent,
    RowDragEnterEvent,
    RowDragEvent,
    RowDragLeaveEvent,
    RowDragMoveEvent,
} from '../events';
import { _getNormalisedMousePosition } from '../gridBodyComp/mouseEventUtils';
import { _addGridCommonParams, _getRowIdCallback, _isClientSideRowModel } from '../gridOptionsUtils';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
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

interface RowsMove {
    rows: RowNode[];
    target: RowNode | null | undefined;
    position: RowHighlightPosition;
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
                const rowsMove = this.getRowsMove(draggingEvent);
                this.clientSideRowModel.highlightRow(rowsMove?.target, rowsMove?.position);
            }
        } else {
            const rowsMove = this.getRowsMove(draggingEvent);
            if (rowsMove) {
                this.moveRows(rowsMove);
            }
        }
    }

    private getRowIndexNumber(rowNode: RowNode): number {
        const rowIndexStr = rowNode.getRowIndexString()!;

        return parseInt(_last(rowIndexStr.split('-')), 10);
    }

    private moveRowAndClearHighlight(draggingEvent: DraggingEvent): void {
        const clientSideRowModel = this.clientSideRowModel;

        if (this.isFromThisGrid(draggingEvent)) {
            const rowsMove = this.getRowsMove(draggingEvent);
            if (rowsMove) {
                this.moveRows(rowsMove);
            }
        } else {
            const getRowIdFunc = _getRowIdCallback(this.gos);

            const pixel = _getNormalisedMousePosition(this.beans, draggingEvent).y;
            const rowIndex = clientSideRowModel.getRowIndexAtPixel(pixel);

            let addIndex = rowIndex + 1;
            const rowNode = clientSideRowModel.getRow(rowIndex);
            if (rowNode && pixel - rowNode.rowTop! < rowNode.rowHeight! / 2) {
                --addIndex;
            }

            clientSideRowModel.updateRowData({
                add: (draggingEvent.dragItem.rowNodes as RowNode[])
                    .filter(
                        (node) =>
                            !clientSideRowModel.getRowNode(
                                getRowIdFunc?.({ data: node.data, level: 0, rowPinned: node.rowPinned }) ?? node.data.id
                            )
                    )
                    .map((node) => node.data),
                addIndex,
            });
        }

        this.clientSideRowModel.highlightRow(null);
    }

    private getRowsMove(draggingEvent: DraggingEvent): RowsMove | null {
        const rows = draggingEvent.dragItem.rowNodes as RowNode[] | undefined;
        if (!rows?.length) {
            return null; // No rows to move
        }
        const source = (draggingEvent.dragItem.rowNode as RowNode | undefined) ?? rows[0];
        const y = _getNormalisedMousePosition(this.beans, draggingEvent).y;
        const clientSideRowModel = this.clientSideRowModel;
        const targetRowIndex = clientSideRowModel.getRowIndexAtPixel(y);
        let target = clientSideRowModel.getRow(targetRowIndex);

        if (!source || target === source || !target) {
            return null; // Nothing to move
        }

        let minRowIdx = targetRowIndex;
        let maxRowIdx = targetRowIndex;
        let targetInRows = false;

        for (const row of rows!) {
            const rowIndex = row.rowIndex;
            if (rowIndex !== null) {
                minRowIdx = rowIndex < minRowIdx ? rowIndex : minRowIdx;
                maxRowIdx = rowIndex > maxRowIdx ? rowIndex : maxRowIdx;
                targetInRows ||= row === target;
            }
        }

        let delta = targetRowIndex - (source.rowIndex ?? targetRowIndex);
        if (targetInRows) {
            if (delta > 0) {
                target = clientSideRowModel.getRow(maxRowIdx + 1) ?? target;
            } else if (delta < 0) {
                target = clientSideRowModel.getRow(minRowIdx > 0 ? minRowIdx - 1 : minRowIdx) ?? target;
            }
        } else if (delta < -1 || delta > 1) {
            delta = y - target.rowTop! < target.rowHeight! / 2 ? -1 : 1;
        }

        return {
            rows,
            target,
            position: delta > 0 ? 'Below' : 'Above',
        };
    }

    private moveRows(rowsMove: RowsMove): void {
        // Get the focussed cell so we can ensure it remains focussed after the move
        const focusSvc = this.beans.focusSvc;
        const cellPosition = focusSvc.getFocusedCell();
        const cellCtrl = cellPosition && _getCellByPosition(this.beans, cellPosition);
        const { rows, target, position } = rowsMove;
        if (this.moveRowNodes(rows, target, position)) {
            if (cellCtrl) {
                cellCtrl.focusCell();
            } else {
                focusSvc.clearFocusedCell();
            }
        }
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
            this.clientSideRowModel.highlightRow(null);
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
            this.moveRowAndClearHighlight(draggingEvent);
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
            this.clientSideRowModel.highlightRow(null);
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
    private moveRowNodes(rows: RowNode[], target: RowNode | null | undefined, position: RowHighlightPosition): boolean {
        const rowsToMoveSet = this.getValidRowsToMove(rows);

        if (!this.reorderLeafChildren(rowsToMoveSet, ...this.getMoveRowsBounds(rowsToMoveSet, target, position))) {
            return false; // Nothing changed
        }

        this.clientSideRowModel.refreshModel({
            step: 'group',
            keepRenderedRows: true,
            animate: !this.gos.get('suppressAnimationFrame'),
            changedPath: new ChangedPath(false, this.clientSideRowModel.rootNode!),
            rowNodesOrderChanged: true,
        });
        return true;
    }

    /** Creates a set of valid rows to move, filtering out rows that are not leafs or are not in the current model (deleted) */
    private getValidRowsToMove(rows: RowNode[]): Set<RowNode> {
        const clientSideRowModel = this.clientSideRowModel;
        const rowsSet = new Set<RowNode>();
        for (const row of rows) {
            // Filter out rows that are not leafs
            if (row.sourceRowIndex >= 0 && (row.rowTop !== null || row === clientSideRowModel.getRowNode(row.id!))) {
                rowsSet.add(row);
            }
        }
        return rowsSet;
    }

    /** For reorderLeafChildren, returns min index of the rows to move, the target index and the max index of the rows to move. */
    private getMoveRowsBounds(
        rows: Iterable<RowNode>,
        target: RowNode | null | undefined,
        position: RowHighlightPosition
    ) {
        const totalRows = this.clientSideRowModel.rootNode?.allLeafChildren!.length ?? 0;
        let targetPositionIdx = target?.sourceRowIndex ?? -1;
        if (targetPositionIdx < 0 || targetPositionIdx >= totalRows) {
            targetPositionIdx = totalRows;
        } else if (position === 'Below') {
            ++targetPositionIdx;
        }
        let firstAffectedLeafIdx = targetPositionIdx;
        let lastAffectedLeafIndex = Math.min(targetPositionIdx, totalRows - 1);
        for (const { sourceRowIndex } of rows) {
            if (sourceRowIndex < firstAffectedLeafIdx) firstAffectedLeafIdx = sourceRowIndex;
            if (sourceRowIndex > lastAffectedLeafIndex) lastAffectedLeafIndex = sourceRowIndex;
        }
        return [firstAffectedLeafIdx, targetPositionIdx, lastAffectedLeafIndex] as const;
    }

    /** Reorders the children of the root node, so that the rows to move are in the correct order.
     * @param rowsToMoveSet The valid set of rows to move, as returned by getValidRowsToMove
     * @param firstAffectedLeafIdx The first index of the rows to move
     * @param targetPositionIdx The target index, where the rows will be moved
     * @param lastAffectedLeafIndex The last index of the rows to move
     * @returns True if the order of the rows changed, false otherwise
     */
    private reorderLeafChildren(
        rowsToMoveSet: ReadonlySet<WritableRowNode>,
        firstAffectedLeafIdx: number,
        targetPositionIdx: number,
        lastAffectedLeafIndex: number
    ): boolean {
        let orderChanged = false;

        const allLeafChildren: WritableRowNode[] | null | undefined = this.clientSideRowModel.rootNode?.allLeafChildren;
        if (!rowsToMoveSet.size || !allLeafChildren) {
            return false;
        }

        // First partition. Filter from left to right, so the middle can be overwritten
        let writeIdxLeft = firstAffectedLeafIdx;
        for (let readIdx = firstAffectedLeafIdx; readIdx < targetPositionIdx; ++readIdx) {
            const row = allLeafChildren[readIdx];
            if (!rowsToMoveSet.has(row)) {
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
            if (!rowsToMoveSet.has(row)) {
                if (row.sourceRowIndex !== writeIdxRight) {
                    row.sourceRowIndex = writeIdxRight;
                    allLeafChildren[writeIdxRight] = row;
                    orderChanged = true;
                }
                --writeIdxRight;
            }
        }

        // Second partition. Overwrites the middle between the other two filtered partitions
        for (const row of rowsToMoveSet) {
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
