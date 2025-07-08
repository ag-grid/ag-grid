import { AutoScrollService } from '../../autoScrollService';
import { BeanStub } from '../../context/beanStub';
import { _getCellByPosition } from '../../entities/positionUtils';
import type { RowNode } from '../../entities/rowNode';
import type { RowDragEvent } from '../../events';
import { _getNormalisedMousePosition } from '../../gridBodyComp/mouseEventUtils';
import {
    _addGridCommonParams,
    _getGroupingApproach,
    _getRowIdCallback,
    _isClientSideRowModel,
} from '../../gridOptionsUtils';
import type { IClientSideRowModel } from '../../interfaces/iClientSideRowModel';
import { ChangedPath } from '../../utils/changedPath';
import { _warn } from '../../validation/logging';
import type { DragAndDropIcon, DraggingEvent, DropTarget } from '../dragAndDropService';
import { DragSourceType } from '../dragAndDropService';
import type {
    IsRowValidDropPositionParams,
    RowDropZoneEvents,
    RowDropZoneParams,
    ValidRowsDropPosition,
} from './rowDragFeatureTypes';
import type { InternalRowDropZoneParams, RowDragEventType, WritableRowNode } from './rowDragFeatureUtils';
import {
    compareRowIndex,
    filterRowsToMove,
    getLeafRow,
    getLeafSourceRowIndex,
    getPrevOrNextRow,
    reorderLeafChildren,
    rowsHaveSameParent,
    targetRowShouldBeParent,
} from './rowDragFeatureUtils';

export class RowDragFeature extends BeanStub implements DropTarget {
    private clientSideRowModel: IClientSideRowModel;
    private eContainer: HTMLElement | null = null;
    private lastDraggingEvent: DraggingEvent | null = null;
    private autoScrollService: AutoScrollService | null = null;

    private makeGroupThrottleTimer: number | null = null;
    private makeGroupThrottleTarget: RowNode | null = null;
    private makeGroupThrottled = false;

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
            let oldVScroll = 0;
            const getVScroll = () => gridBodyCon.scrollFeature.getVScrollPosition().top;

            this.autoScrollService = new AutoScrollService({
                scrollContainer: gridBodyCon.eBodyViewport,
                scrollAxis: 'y',
                getVerticalPosition: getVScroll,
                setVerticalPosition: (position) => gridBodyCon.scrollFeature.setVerticalScrollPosition(position),
                onScrollCallback: () => {
                    const newVScroll = getVScroll();
                    if (oldVScroll !== newVScroll) {
                        oldVScroll = newVScroll;
                        const lastDraggingEvent = this.lastDraggingEvent;
                        if (lastDraggingEvent) {
                            this.onDragging(lastDraggingEvent);
                        }
                    }
                },
            });
        });
    }

    public override destroy(): void {
        super.destroy();

        this.eContainer = null!;
        this.lastDraggingEvent = null!;
        this.makeGroupThrottleClear();
        const autoScrollService = this.autoScrollService;
        if (autoScrollService) {
            this.autoScrollService = null!;
            autoScrollService?.ensureCleared();
        }
    }

    public getContainer(): HTMLElement {
        return this.eContainer!;
    }

    public isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.RowDrag;
    }

    public getIconName(): DragAndDropIcon {
        if (this.gos.get('rowDragManaged') && this.shouldPreventRowMove()) {
            return 'notAllowed';
        }
        const lastDraggingEvent = this.lastDraggingEvent;
        if (lastDraggingEvent && this.gos.get('suppressMoveWhenRowDragging')) {
            const rowsDrop = lastDraggingEvent.dragItem.rowsDrop;
            if (rowsDrop === null || rowsDrop?.rows.length === 0) {
                return 'notAllowed';
            }
        }
        return 'move';
    }

    public shouldPreventRowMove(): boolean {
        const { rowGroupColsSvc, filterManager, sortSvc } = this.beans;
        if (rowGroupColsSvc?.columns?.length) {
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
        if (this.gos.get('rowDragMultiRow')) {
            const selectedNodes = this.beans.selectionSvc?.getSelectedNodes();
            if (selectedNodes && selectedNodes.indexOf(currentNode) >= 0) {
                return selectedNodes.slice().sort(compareRowIndex);
            }
        }

        return [currentNode];
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        // builds a lits of all rows being dragged before firing events
        const rowNodes = this.getRowNodes(draggingEvent);
        draggingEvent.dragItem.rowNodes = rowNodes;

        // when entering, we fire the enter event, then in onEnterOrDragging,
        // we also fire the move event. so we get both events when entering.
        this.dispatchGridEvent('rowDragEnter', draggingEvent);

        for (const rowNode of rowNodes) {
            this.setRowNodeDragging(rowNode, true);
        }

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
        if (!this.autoScrollService) {
            return; // destroyed
        }

        // this event is fired for enter and move
        this.dispatchGridEvent('rowDragMove', draggingEvent);

        this.lastDraggingEvent = draggingEvent;

        if (this.gos.get('rowDragManaged')) {
            this.doManagedDrag(draggingEvent, true);
        }

        this.autoScrollService.check(draggingEvent.event);
    }

    private doManagedDrag(draggingEvent: DraggingEvent, throttleMakeGroup: boolean): void {
        if (!this.shouldPreventRowMove()) {
            const { dragAndDrop, gos } = this.beans;
            const isFromThisGrid = this.isFromThisGrid(draggingEvent);

            if (gos.get('suppressMoveWhenRowDragging') || !isFromThisGrid) {
                if (dragAndDrop!.isDropZoneWithinThisGrid(draggingEvent)) {
                    const rowsDrop = this.managedRowsDrop(draggingEvent, throttleMakeGroup);
                    draggingEvent.dragItem.rowsDrop = rowsDrop;
                    const target = rowsDrop?.target;
                    const rowDropHighlightSvc = this.beans.rowDropHighlightSvc!;
                    if (target && rowsDrop.rows.length && rowsDrop.position !== 'none') {
                        rowDropHighlightSvc.set(target as RowNode, rowsDrop.position);
                    } else {
                        rowDropHighlightSvc.clear();
                    }
                }
            } else {
                const rowsDrop = this.managedRowsDrop(draggingEvent, throttleMakeGroup);
                draggingEvent.dragItem.rowsDrop = rowsDrop;
                if (rowsDrop) {
                    this.dropRows(rowsDrop);
                }
            }
        }

        draggingEvent.dragItem.rowsDrop ??= null;
    }

    private managedRowsDrop(draggingEvent: DraggingEvent, throttleMakeGroup: boolean): ValidRowsDropPosition | null {
        const { beans, gos, clientSideRowModel } = this;
        const rootNode = clientSideRowModel.rootNode;
        const dragItem = draggingEvent.dragItem;
        const rowNode = dragItem.rowNode;
        let rows = dragItem.rowNodes;
        rows = rows?.length ? rows : rowNode ? [rowNode] : [];
        const source = rows.length && (rowNode ?? rows[0]);

        if (!source || !rootNode) {
            this.makeGroupThrottleClear();
            return null; // Nothing to move
        }

        const y = _getNormalisedMousePosition(beans, draggingEvent).y;
        let targetRowIndex = clientSideRowModel.getRowIndexAtPixel(y);
        let target = clientSideRowModel.getRow(targetRowIndex) ?? null;
        const moved = source !== target;

        const sameGrid = this.isFromThisGrid(draggingEvent);
        const groupingApproach = _getGroupingApproach(gos);
        const canSetParent =
            // We don't yet support drag and drop with grouping
            groupingApproach !== 'group' &&
            // We don't yet support moving tree rows from a different grid in a structured way
            sameGrid;

        let newParent: RowNode | null = null;
        let yDelta: number;

        if (canSetParent && target?.footer) {
            // Footer row. Get the real parent, that is the sibling of the footer
            newParent = target.sibling ?? rootNode;
            const found =
                getPrevOrNextRow(clientSideRowModel, target, -1) || getPrevOrNextRow(clientSideRowModel, target, 1);
            yDelta = found && found.rowIndex! > target.rowIndex! ? -0.5 : 0.5;
            target = found ?? null;
        } else {
            yDelta = target ? (y - target.rowTop! - target.rowHeight! / 2) / target.rowHeight! || 0 : 1;
        }

        let above = yDelta < 0;
        let targetInRows = false;
        if (sameGrid && target) {
            if (!moved) {
                if (Math.abs(yDelta) <= 0.5) {
                    this.makeGroupThrottleClear();
                    return null; // Nothing to move
                }
                targetInRows = true;
            } else {
                targetInRows = rows.indexOf(target) >= 0;
                if (targetInRows) {
                    const newTarget =
                        targetRowIndex < source.rowIndex!
                            ? getPrevOrNextRow(clientSideRowModel, rows[0], -1)
                            : getPrevOrNextRow(clientSideRowModel, rows[rows.length - 1], 1);
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

        this.makeGroupThrottleUpdate(target);

        if (newParent === null && canSetParent) {
            if (!target || (yDelta >= 0.5 && target.rowIndex === beans.pageBounds.getLastRow())) {
                newParent = rootNode; // Dragging outside of the rows, move to last row at the root level
            } else if (targetRowShouldBeParent(clientSideRowModel, target, yDelta, targetInRows, rows)) {
                if (this.makeGroupThrottled) {
                    newParent = target;
                }
                if (throttleMakeGroup && (newParent === null || !target.expanded)) {
                    this.makeGroupThrottleStart(target);
                }
            }
            newParent ??= target?.parent ?? rootNode;
        }

        let inside = false;
        if (newParent !== null) {
            if (newParent === target && newParent !== rootNode) {
                inside = true; // Dragging as child

                const firstRow = newParent.expanded ? getPrevOrNextRow(clientSideRowModel, target, 1) : null;
                if (firstRow?.parent === newParent) {
                    target = firstRow; // Instead of showing "inside" style, we can show "above" by using first child as target
                    inside = false;
                    above = true;
                }
            }

            if (target && !inside) {
                // Set target to the first group that is not the root node or the new parent
                let current: RowNode | null = target;
                while (current && current !== rootNode && current !== newParent) {
                    target = current;
                    current = current.parent;
                }
            }

            if (rowsHaveSameParent(rows, newParent)) {
                newParent = null; // No need to set parent if all rows have already the same parent
            }
        }

        if (!newParent && targetInRows && (canSetParent || source === target)) {
            // No delta dragging of multiple rows with TreeData or no change, nothing to move
            return null;
        }

        return this.filterRowsDrop(
            {
                api: beans.gridApi,
                context: beans.gridOptions.context,
                rootNode: clientSideRowModel.rootNode!,
                draggingEvent,
                sameGrid,
                position: inside ? 'inside' : above ? 'above' : 'below',
                source,
                target,
                newParent,
                rows,
                withSource: true,
            },
            above
        );
    }

    private filterRowsDrop(
        rowsDrop: ValidRowsDropPosition & IsRowValidDropPositionParams,
        above: boolean
    ): ValidRowsDropPosition {
        let customPosition = false;
        const isRowValidDropPosition = this.gos.get('isRowValidDropPosition');
        if (isRowValidDropPosition) {
            const canDropResult = isRowValidDropPosition(rowsDrop);
            if (!canDropResult) {
                rowsDrop.rows = []; // Cannot drop, so no rows
            } else if (typeof canDropResult === 'object') {
                // Custom result, override the default values
                if (canDropResult.newParent !== undefined) {
                    rowsDrop.newParent = canDropResult.newParent;
                }
                if (canDropResult.rows !== undefined) {
                    rowsDrop.rows = canDropResult.rows || [];
                }
                if (canDropResult.target !== undefined) {
                    rowsDrop.target = canDropResult.target;
                }
                if (canDropResult.position) {
                    customPosition = true;
                    (rowsDrop as ValidRowsDropPosition).position = canDropResult.position;
                }
            }
        }

        filterRowsToMove(this.clientSideRowModel, rowsDrop);
        if (!customPosition && (!rowsDrop.newParent || !rowsDrop.rows.length)) {
            rowsDrop.position = above ? 'above' : 'below'; // Remove 'inside' if no new parent
        }
        return rowsDrop;
    }

    private makeGroupThrottleUpdate(target: RowNode | null) {
        const makeGroupThrottleTarget = this.makeGroupThrottleTarget;
        if (makeGroupThrottleTarget !== null && makeGroupThrottleTarget !== target) {
            this.makeGroupThrottleClear();
        }

        if (target?.expanded && target.childrenAfterSort?.length) {
            this.makeGroupThrottled = true;
            this.makeGroupThrottleTarget = target;
        }
    }

    private makeGroupThrottleStart(target: RowNode | null) {
        this.makeGroupThrottleTarget = target;
        if (this.makeGroupThrottleTimer === null) {
            this.makeGroupThrottleTimer = window.setTimeout(
                this.makeGroupThrottleCallback,
                this.gos.get('rowDragInsertDelay')
            );
        }
    }

    private makeGroupThrottleCallback = () => {
        this.makeGroupThrottleTimer = null;
        const event = this.lastDraggingEvent;
        if (event) {
            this.makeGroupThrottled = true;
            this.doManagedDrag(event, false);
            const target = this.makeGroupThrottleTarget;
            if (target && !target.expanded && target.childrenAfterSort?.length && target.isExpandable()) {
                target.setExpanded(true, this.lastDraggingEvent?.event, true);
            }
        }
    };

    private makeGroupThrottleClear() {
        this.makeGroupThrottled = false;
        this.makeGroupThrottleTarget = null;
        const timer = this.makeGroupThrottleTimer;
        if (timer !== null) {
            this.makeGroupThrottleTimer = null;
            clearTimeout(timer);
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
        const y = _getNormalisedMousePosition(beans, draggingEvent).y;
        const mouseIsPastLastRow = y > pageBounds.getCurrentPagePixelRange().pageLastPixel;

        let overIndex = -1;
        let overNode: RowNode | undefined;

        if (!mouseIsPastLastRow) {
            overIndex = rowModel.getRowIndexAtPixel(y);
            overNode = rowModel.getRow(overIndex);
        }

        return _addGridCommonParams(gos, {
            type: type,
            event: draggingEvent.event,
            node: draggingEvent.dragItem.rowNode!,
            nodes: draggingEvent.dragItem.rowNodes!,
            overIndex: overIndex,
            overNode: overNode,
            y,
            vDirection: draggingEvent.vDirection,
        });
    }

    private dispatchGridEvent(type: RowDragEventType, draggingEvent: DraggingEvent): void {
        this.eventSvc.dispatchEvent(this.draggingToRowDragEvent(type, draggingEvent));
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        this.dispatchGridEvent('rowDragLeave', draggingEvent);
        this.stopDragging(draggingEvent);

        if (this.gos.get('rowDragManaged')) {
            this.beans.rowDropHighlightSvc!.clear();
        }

        this.makeGroupThrottleClear();
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
            const rowsDrop = this.managedRowsDrop(draggingEvent, false);
            draggingEvent.dragItem.rowsDrop = rowsDrop;
            if (rowsDrop) {
                this.dropRows(rowsDrop);
            }
            this.beans.rowDropHighlightSvc!.clear();
        }

        this.makeGroupThrottleClear();
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
        this.makeGroupThrottleClear();
    }

    private stopDragging(draggingEvent: DraggingEvent): void {
        this.autoScrollService?.ensureCleared();
        for (const rowNode of this.getRowNodes(draggingEvent)) {
            this.setRowNodeDragging(rowNode, false);
        }
    }

    private setRowNodeDragging(rowNode: RowNode, dragging: boolean): void {
        if (rowNode.dragging !== dragging) {
            rowNode.dragging = dragging;
            rowNode.dispatchRowEvent('draggingChanged');
        }
    }

    /** Drag and drop. Returns false if at least a row was moved, otherwise true */
    private dropRows(rowsDrop: ValidRowsDropPosition): boolean {
        return rowsDrop.sameGrid ? this.moveRows(rowsDrop) : this.addRows(rowsDrop);
    }

    private addRows({ position, target, rows }: ValidRowsDropPosition): boolean {
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

        const addIndex = target ? getLeafSourceRowIndex(target) + (position === 'above' ? 0 : 1) : undefined;
        clientSideRowModel.updateRowData({ add, addIndex });

        return true;
    }

    private moveRows({ rootNode, position, target, rows, newParent }: ValidRowsDropPosition): boolean {
        let changed = false;

        const leafs = new Set<WritableRowNode>();
        for (const row of rows as WritableRowNode[]) {
            if (newParent && row.parent !== newParent) {
                row.treeParent = newParent as RowNode | null;
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

        if (reorderLeafChildren(rootNode as RowNode, leafs, target, position === 'above')) {
            changed = true;
        }

        if (!changed) {
            return false;
        }

        this.clientSideRowModel.refreshModel({
            step: 'group',
            keepRenderedRows: true,
            animate: !this.gos.get('suppressAnimationFrame'),
            changedPath: new ChangedPath(false, this.clientSideRowModel.rootNode!),
            rowNodesOrderChanged: true,
        });

        // Get the focussed cell so we can ensure it remains focussed after the move
        if (cellCtrl) {
            cellCtrl.focusCell();
        } else {
            focusSvc.clearFocusedCell();
        }
        return true;
    }
}
