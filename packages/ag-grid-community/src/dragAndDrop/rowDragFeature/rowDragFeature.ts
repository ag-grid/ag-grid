import { _getClientSideRowModel } from '../../api/rowModelApiUtils';
import { BeanStub } from '../../context/beanStub';
import { _getCellByPosition } from '../../entities/positionUtils';
import type { RowNode } from '../../entities/rowNode';
import type { RowDragEvent } from '../../events';
import { _getNormalisedMousePosition } from '../../gridBodyComp/mouseEventUtils';
import { _getGroupingApproach, _getRowIdCallback } from '../../gridOptionsUtils';
import type { DropIndicatorPosition } from '../../interfaces/IRowDropHighlightService';
import type { IClientSideRowModel } from '../../interfaces/iClientSideRowModel';
import type { IRowNode } from '../../interfaces/iRowNode';
import { ChangedPath } from '../../utils/changedPath';
import { _warn } from '../../validation/logging';
import type { DragAndDropIcon, DraggingEvent, DropTarget } from '../dragAndDropService';
import { DragSourceType } from '../dragAndDropService';
import type {
    IsRowValidDropPositionParams,
    RowDropEventType,
    RowDropZoneEvents,
    RowDropZoneParams,
    RowsDropPosition,
} from './rowDragFeatureTypes';
import type { InternalRowDropZoneParams, InternalRowsDrop, RowDragEventType } from './rowDragLogic';
import {
    dragLeafChildren,
    fixDragTargetAndGetDelta,
    processRowsDropResult,
    targetRowShouldBeParent,
    updateRowsDropPosition,
} from './rowDragLogic';
import { RowDragNudger } from './rowDragNudger';
import { compareRowIndex, getLeafSourceRowIndex, setRowNodesDragging } from './rowDragRowUtils';

export class RowDragFeature extends BeanStub implements DropTarget {
    private clientSideRowModel: IClientSideRowModel;
    private nudger: RowDragNudger | null = null;
    private lastDraggingEvent: DraggingEvent | null = null;

    constructor(private eContainer: HTMLElement) {
        super();
    }

    public postConstruct(): void {
        this.clientSideRowModel = _getClientSideRowModel(this.beans)!;
        this.beans.ctrlsSvc.whenReady(this, (p) => {
            this.nudger = new RowDragNudger(this.beans, p.gridBodyCtrl);
        });
    }

    public override destroy(): void {
        super.destroy();
        this.nudger?.clear();
        this.nudger = null;
        this.lastDraggingEvent = null!;
        this.eContainer = null!;
    }

    public getContainer(): HTMLElement {
        return this.eContainer!;
    }

    public isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.RowDrag;
    }

    public getIconName(): DragAndDropIcon {
        const gos = this.gos;
        const lastDraggingEvent = this.lastDraggingEvent;
        const rowsDrop = lastDraggingEvent?.rowsDrop;
        const rowDragManaged = rowsDrop?.rowDragManaged ?? gos.get('rowDragManaged');
        if (rowsDrop && !rowsDrop.allowDrop && (!rowDragManaged || rowsDrop.suppressMoveWhenRowDragging)) {
            return 'notAllowed';
        }
        if (rowDragManaged && this.shouldPreventRowMove()) {
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
        setRowNodesDragging(rowNodes, true);
        this.onEnterOrDragging(draggingEvent, 'rowDragEnter');
    }

    public onDragging(draggingEvent: DraggingEvent): void {
        this.onEnterOrDragging(draggingEvent, 'rowDragMove');
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        this.dispatchGridEvent('rowDragLeave', draggingEvent);
        this.stopDragging(draggingEvent);
    }

    public onDragStop(draggingEvent: DraggingEvent): void {
        this.rowsDrop(draggingEvent, 'rowDragEnd');
        this.dispatchGridEvent('rowDragEnd', draggingEvent);
        this.stopDragging(draggingEvent);
    }

    public onDragCancel(draggingEvent: DraggingEvent): void {
        this.dispatchGridEvent('rowDragCancel', draggingEvent);
        this.stopDragging(draggingEvent);
    }

    private onEnterOrDragging(draggingEvent: DraggingEvent, type: RowDropEventType): void {
        if (!this.nudger) return; // not ready or destroyed

        this.lastDraggingEvent = draggingEvent;
        this.rowsDrop(draggingEvent, type);
        this.beans.rowDropHighlightSvc?.fromDrag(draggingEvent, false);

        if (type === 'rowDragEnter') {
            // we fire rowDragEnter, then onEnterOrDragging, and also rowDragMove
            this.dispatchGridEvent('rowDragEnter', draggingEvent);
        }

        this.dispatchGridEvent('rowDragMove', draggingEvent); // this event is fired for enter and move

        this.nudger?.autoScrollService?.check(draggingEvent.event);
    }

    private stopDragging(draggingEvent: DraggingEvent): void {
        setRowNodesDragging(draggingEvent.dragItem.rowNodes, false);
        this.nudger?.clear();
        this.beans.rowDropHighlightSvc?.fromDrag(draggingEvent, true);
    }

    private isFromThisGrid(draggingEvent: DraggingEvent) {
        return draggingEvent.dragSource.dragSourceDomDataKey === this.gos.getDomDataKey();
    }

    private rowsDrop(draggingEvent: DraggingEvent, type: RowDropEventType): void {
        const { nudger, gos, beans, clientSideRowModel } = this;
        const rootNode = clientSideRowModel.rootNode;
        if (!rootNode || !nudger) {
            return; // Destroyed
        }
        const sameGrid = this.isFromThisGrid(draggingEvent);
        const rowDragManaged = gos.get('rowDragManaged');
        const suppressMoveWhenRowDragging = gos.get('suppressMoveWhenRowDragging');

        let position: DropIndicatorPosition = 'below';
        let allowDrop = !rowDragManaged || !this.shouldPreventRowMove();
        if (
            allowDrop &&
            rowDragManaged &&
            (!sameGrid || suppressMoveWhenRowDragging) &&
            !beans.dragAndDrop?.isDropZoneWithinThisGrid(draggingEvent)
        ) {
            allowDrop = false;
            position = 'none';
        }

        const groupingApproach = _getGroupingApproach(gos);
        const hierarchical =
            // We don't yet support drag and drop with grouping
            groupingApproach !== 'group' &&
            // We don't yet support moving tree rows from a different grid in a structured way
            sameGrid;

        const y = _getNormalisedMousePosition(beans, draggingEvent).y;
        const overNode = this.getOverNode(y);
        const { rowNode, rowNodes } = draggingEvent.dragItem;
        const rowsDrop: InternalRowsDrop = {
            api: beans.gridApi,
            context: beans.gridOptions.context,
            type: type,
            draggingEvent,
            y,
            hierarchical,
            rowDragManaged,
            suppressMoveWhenRowDragging,
            sameGrid,
            rootNode,
            source: rowNode!,
            rows: rowNodes!,
            overNode,
            target: overNode ?? null,
            position,
            newParent: null,
            allowDrop,
            _sourceInRows: true,
            _yDelta: 0,
        };
        draggingEvent.rowsDrop = rowsDrop; // Add to the event

        if (!rowsDrop) {
            return;
        }

        const rowsSet = new Set<IRowNode>();
        fixDragTargetAndGetDelta(clientSideRowModel, rowsDrop, rowsSet);

        this.updateRowsDropParent(draggingEvent, rowsDrop, rowsSet);

        updateRowsDropPosition(clientSideRowModel, rowsDrop);

        const isRowValidDropPosition = rowsDrop.allowDrop && this.gos.get('isRowValidDropPosition');
        const customPosition =
            isRowValidDropPosition &&
            processRowsDropResult(rowsDrop, isRowValidDropPosition(rowsDrop as IsRowValidDropPositionParams));

        if (rowsDrop.rowDragManaged) {
            // const update = rowsDrop.allowDrop  );
            if (!this.managedDropRows(rowsDrop, type === 'rowDragEnd' || !rowsDrop.suppressMoveWhenRowDragging)) {
                rowsDrop.allowDrop = false;
            }
            if (!customPosition && rowsDrop.position !== 'none' && (!rowsDrop.newParent || !rowsDrop.rows.length)) {
                rowsDrop.position = rowsDrop._yDelta < 0 ? 'above' : 'below'; // Remove 'inside' if no new parent
            }
        }
    }

    private updateRowsDropParent(
        draggingEvent: DraggingEvent,
        rowsDrop: InternalRowsDrop,
        rowsSet: Set<IRowNode>
    ): void {
        const nudger = this.nudger;
        if (!nudger) {
            return; // Destroyed
        }
        nudger.updateGroup(rowsDrop.target);
        let newParent: IRowNode | null = rowsDrop.newParent;
        if (!rowsDrop.hierarchical || newParent) {
            return;
        }
        const { rootNode, target } = rowsDrop;
        if (!target || (rowsDrop._yDelta >= 0.5 && target.rowIndex! >= this.beans.pageBounds.getLastRow())) {
            newParent = rootNode; // Dragging outside of the rows, move to last row at the root level
        } else if (targetRowShouldBeParent(this.clientSideRowModel, rowsDrop, rowsSet)) {
            if (nudger.groupThrottled) {
                newParent = target;
            }
            if (
                rowsDrop.type !== 'rowDragEnd' &&
                !draggingEvent.fromNudge &&
                (!newParent || (target && !target.expanded && !!target.childrenAfterSort?.length))
            ) {
                nudger.startGroup(target);
            }
        }
        newParent ??= target?.parent ?? rootNode;
        rowsDrop.newParent = newParent;
    }

    public addRowDropZone(params: RowDropZoneParams & { fromGrid?: boolean }): void {
        if (!params.getContainer?.()) {
            _warn(55);
            return;
        }
        const dragAndDrop = this.beans.dragAndDrop!;
        if (dragAndDrop.findExternalZone(params)) {
            _warn(56);
            return;
        }
        const { fromGrid, getContainer, onDragEnter, onDragLeave, onDragging, onDragStop, onDragCancel } =
            params as DropTarget & { fromGrid?: boolean };
        const dropTarget: DropTarget = {
            getContainer,
            isInterestedIn: (type: DragSourceType) => type === DragSourceType.RowDrag,
            getIconName: () => 'move',
            external: true,
            onDragEnter: fromGrid
                ? onDragEnter
                : onDragEnter && ((e) => params.onDragEnter!(this.toRowDragEvent('rowDragEnter', e))),
            onDragLeave: fromGrid
                ? onDragLeave
                : onDragLeave && ((e) => params.onDragLeave!(this.toRowDragEvent('rowDragLeave', e))),
            onDragging: fromGrid
                ? onDragging
                : onDragging && ((e) => params.onDragging!(this.toRowDragEvent('rowDragMove', e))),
            onDragStop: fromGrid
                ? onDragStop
                : onDragStop && ((e) => params.onDragStop!(this.toRowDragEvent('rowDragEnd', e))),
            onDragCancel: fromGrid
                ? onDragCancel
                : onDragCancel && ((e) => params.onDragCancel!(this.toRowDragEvent('rowDragCancel', e))),
        };
        dragAndDrop.addDropTarget(dropTarget);
        this.addDestroyFunc(() => dragAndDrop.removeDropTarget(dropTarget));
    }

    public getRowDropZone(events?: RowDropZoneEvents): RowDropZoneParams {
        const params: InternalRowDropZoneParams = {
            getContainer: this.getContainer.bind(this),
            onDragEnter: (e) => {
                this.onDragEnter(e);
                events?.onDragEnter?.(this.toRowDragEvent('rowDragEnter', e));
            },
            onDragLeave: (e) => {
                this.onDragLeave(e);
                events?.onDragLeave?.(this.toRowDragEvent('rowDragLeave', e));
            },
            onDragging: (e) => {
                this.onDragging(e);
                events?.onDragging?.(this.toRowDragEvent('rowDragMove', e));
            },
            onDragStop: (e) => {
                this.onDragStop(e);
                events?.onDragStop?.(this.toRowDragEvent('rowDragEnd', e));
            },
            onDragCancel: (e) => {
                this.onDragCancel(e);
                events?.onDragCancel?.(this.toRowDragEvent('rowDragCancel', e));
            },
            fromGrid: true /* @private */,
        } satisfies InternalRowDropZoneParams;
        return params as RowDropZoneParams; // Cast to RowDropZoneParams to hide the internal properties
    }

    private getOverNode(y: number): RowNode | undefined {
        const { pageBounds, rowModel } = this.beans;
        const mouseIsPastLastRow = y > pageBounds.getCurrentPagePixelRange().pageLastPixel;
        const overIndex = mouseIsPastLastRow ? -1 : rowModel.getRowIndexAtPixel(y);
        return overIndex >= 0 ? rowModel.getRow(overIndex) : undefined;
    }

    private toRowDragEvent<T extends RowDragEventType>(type: T, draggingEvent: DraggingEvent): RowDragEvent<T> {
        const beans = this.beans;
        const { dragItem, rowsDrop, event, vDirection } = draggingEvent;
        const withRowsDrop = rowsDrop?.rootNode === this.clientSideRowModel.rootNode;
        const y = withRowsDrop ? rowsDrop.y : _getNormalisedMousePosition(beans, draggingEvent).y;
        const overNode = withRowsDrop ? rowsDrop.overNode : this.getOverNode(y);
        return {
            api: beans.gridApi,
            context: beans.gridOptions.context,
            type,
            event,
            node: dragItem.rowNode!,
            nodes: dragItem.rowNodes!,
            overIndex: overNode?.rowIndex ?? -1,
            overNode,
            y,
            vDirection,
            rowsDrop,
        };
    }

    private dispatchGridEvent(type: RowDragEventType, draggingEvent: DraggingEvent): void {
        this.eventSvc.dispatchEvent(this.toRowDragEvent(type, draggingEvent));
    }

    private managedDropRows(rowsDrop: InternalRowsDrop, update: boolean): boolean {
        return rowsDrop.sameGrid ? this.managedMoveRows(rowsDrop, update) : this.managedAddRows(rowsDrop, update);
    }

    private managedMoveRows(rowsDrop: InternalRowsDrop, update: boolean): boolean {
        // Get the focussed cell so we can ensure it remains focussed after the move
        const { gos, beans, clientSideRowModel } = this;
        const focusSvc = update ? beans.focusSvc : null;
        const cellPosition = focusSvc?.getFocusedCell();
        const cellCtrl = cellPosition && _getCellByPosition(beans, cellPosition);

        const changes = dragLeafChildren(clientSideRowModel, rowsDrop, update);
        if (!changes || !update) {
            return changes;
        }

        clientSideRowModel.refreshModel({
            step: 'group',
            keepRenderedRows: true,
            animate: !gos.get('suppressAnimationFrame'),
            changedPath: new ChangedPath(false, clientSideRowModel.rootNode!),
            rowNodesOrderChanged: true,
        });

        // Get the focussed cell so we can ensure it remains focussed after the move
        if (cellCtrl) {
            cellCtrl.focusCell();
        } else if (focusSvc) {
            focusSvc.clearFocusedCell();
        }
        return true;
    }

    private managedAddRows(rowsDrop: RowsDropPosition, update: boolean): boolean {
        const getRowIdFunc = _getRowIdCallback(this.gos);
        const clientSideRowModel = this.clientSideRowModel;
        const rows = rowsDrop.rows;

        if (!update) {
            return rows.length > 0;
        }

        const add = rowsDrop.rows
            .filter(
                ({ data, rowPinned, footer }) =>
                    !footer && !clientSideRowModel.getRowNode(getRowIdFunc?.({ data, level: 0, rowPinned }) ?? data.id)
            )
            .map(({ data }) => data);

        if (add.length === 0) {
            return false; // Nothing to add
        }

        const { target, position } = rowsDrop;
        const addIndex = target ? getLeafSourceRowIndex(target) + (position === 'above' ? 0 : 1) : undefined;
        clientSideRowModel.updateRowData({ add, addIndex });
        return true;
    }
}
