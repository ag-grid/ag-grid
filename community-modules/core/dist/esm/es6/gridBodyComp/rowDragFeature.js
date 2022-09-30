/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { DragAndDropService, DragSourceType, VerticalDirection } from "../dragAndDrop/dragAndDropService";
import { Autowired, Optional, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { RowHighlightPosition } from "../entities/rowNode";
import { last } from '../utils/array';
import { BeanStub } from "../context/beanStub";
import { missingOrEmpty } from "../utils/generic";
import { doOnce } from "../utils/function";
import { AutoScrollService } from "../autoScrollService";
export class RowDragFeature extends BeanStub {
    constructor(eContainer) {
        super();
        this.isMultiRowDrag = false;
        this.isGridSorted = false;
        this.isGridFiltered = false;
        this.isRowGroupActive = false;
        this.eContainer = eContainer;
    }
    postConstruct() {
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.clientSideRowModel = this.rowModel;
        }
        const refreshStatus = () => {
            this.onSortChanged();
            this.onFilterChanged();
            this.onRowGroupChanged();
        };
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, () => {
            refreshStatus();
        });
        refreshStatus();
        this.ctrlsService.whenReady(() => {
            const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
            this.autoScrollService = new AutoScrollService({
                scrollContainer: gridBodyCon.getBodyViewportElement(),
                scrollAxis: 'y',
                getVerticalPosition: () => gridBodyCon.getScrollFeature().getVScrollPosition().top,
                setVerticalPosition: (position) => gridBodyCon.getScrollFeature().setVerticalScrollPosition(position),
                onScrollCallback: () => { this.onDragging(this.lastDraggingEvent); }
            });
        });
    }
    onSortChanged() {
        this.isGridSorted = this.sortController.isSortActive();
    }
    onFilterChanged() {
        this.isGridFiltered = this.filterManager.isAnyFilterPresent();
    }
    onRowGroupChanged() {
        const rowGroups = this.columnModel.getRowGroupColumns();
        this.isRowGroupActive = !missingOrEmpty(rowGroups);
    }
    getContainer() {
        return this.eContainer;
    }
    isInterestedIn(type) {
        return type === DragSourceType.RowDrag;
    }
    getIconName() {
        const managedDrag = this.gridOptionsWrapper.isRowDragManaged();
        if (managedDrag && this.shouldPreventRowMove()) {
            return DragAndDropService.ICON_NOT_ALLOWED;
        }
        return DragAndDropService.ICON_MOVE;
    }
    shouldPreventRowMove() {
        return this.isGridSorted || this.isGridFiltered || this.isRowGroupActive;
    }
    getRowNodes(draggingEvent) {
        if (!this.isFromThisGrid(draggingEvent)) {
            return draggingEvent.dragItem.rowNodes || [];
        }
        const isRowDragMultiRow = this.gridOptionsWrapper.isRowDragMultiRow();
        const selectedNodes = [...this.selectionService.getSelectedNodes()].sort((a, b) => {
            if (a.rowIndex == null || b.rowIndex == null) {
                return 0;
            }
            return this.getRowIndexNumber(a) - this.getRowIndexNumber(b);
        });
        const currentNode = draggingEvent.dragItem.rowNode;
        if (isRowDragMultiRow && selectedNodes.indexOf(currentNode) !== -1) {
            this.isMultiRowDrag = true;
            return selectedNodes;
        }
        this.isMultiRowDrag = false;
        return [currentNode];
    }
    onDragEnter(draggingEvent) {
        // builds a lits of all rows being dragged before firing events
        draggingEvent.dragItem.rowNodes = this.getRowNodes(draggingEvent);
        // when entering, we fire the enter event, then in onEnterOrDragging,
        // we also fire the move event. so we get both events when entering.
        this.dispatchGridEvent(Events.EVENT_ROW_DRAG_ENTER, draggingEvent);
        this.getRowNodes(draggingEvent).forEach(rowNode => {
            rowNode.setDragging(true);
        });
        this.onEnterOrDragging(draggingEvent);
    }
    onDragging(draggingEvent) {
        this.onEnterOrDragging(draggingEvent);
    }
    isFromThisGrid(draggingEvent) {
        const { dragSourceDomDataKey } = draggingEvent.dragSource;
        return dragSourceDomDataKey === this.gridOptionsWrapper.getDomDataKey();
    }
    isDropZoneWithinThisGrid(draggingEvent) {
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        const gridGui = gridBodyCon.getGui();
        const { dropZoneTarget } = draggingEvent;
        return !gridGui.contains(dropZoneTarget);
    }
    onEnterOrDragging(draggingEvent) {
        // this event is fired for enter and move
        this.dispatchGridEvent(Events.EVENT_ROW_DRAG_MOVE, draggingEvent);
        this.lastDraggingEvent = draggingEvent;
        const pixel = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        const managedDrag = this.gridOptionsWrapper.isRowDragManaged();
        if (managedDrag) {
            this.doManagedDrag(draggingEvent, pixel);
        }
        this.autoScrollService.check(draggingEvent.event);
    }
    doManagedDrag(draggingEvent, pixel) {
        const isFromThisGrid = this.isFromThisGrid(draggingEvent);
        const managedDrag = this.gridOptionsWrapper.isRowDragManaged();
        const rowNodes = draggingEvent.dragItem.rowNodes;
        if (managedDrag && this.shouldPreventRowMove()) {
            return;
        }
        if (this.gridOptionsWrapper.isSuppressMoveWhenRowDragging() || !isFromThisGrid) {
            if (!this.isDropZoneWithinThisGrid(draggingEvent)) {
                this.clientSideRowModel.highlightRowAtPixel(rowNodes[0], pixel);
            }
        }
        else {
            this.moveRows(rowNodes, pixel);
        }
    }
    getRowIndexNumber(rowNode) {
        return parseInt(last(rowNode.getRowIndexString().split('-')), 10);
    }
    moveRowAndClearHighlight(draggingEvent) {
        const lastHighlightedRowNode = this.clientSideRowModel.getLastHighlightedRowNode();
        const isBelow = lastHighlightedRowNode && lastHighlightedRowNode.highlighted === RowHighlightPosition.Below;
        const pixel = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        const rowNodes = draggingEvent.dragItem.rowNodes;
        let increment = isBelow ? 1 : 0;
        if (this.isFromThisGrid(draggingEvent)) {
            rowNodes.forEach(rowNode => {
                if (rowNode.rowTop < pixel) {
                    increment -= 1;
                }
            });
            this.moveRows(rowNodes, pixel, increment);
        }
        else {
            const getRowIdFunc = this.gridOptionsWrapper.getRowIdFunc();
            let addIndex = this.clientSideRowModel.getRowIndexAtPixel(pixel) + 1;
            if (this.clientSideRowModel.getHighlightPosition(pixel) === RowHighlightPosition.Above) {
                addIndex--;
            }
            this.clientSideRowModel.updateRowData({
                add: rowNodes
                    .map(node => node.data)
                    .filter(data => !this.clientSideRowModel.getRowNode(getRowIdFunc ? getRowIdFunc({ data, level: 0 }) : data.id)),
                addIndex
            });
        }
        this.clearRowHighlight();
    }
    clearRowHighlight() {
        this.clientSideRowModel.highlightRowAtPixel(null);
    }
    moveRows(rowNodes, pixel, increment = 0) {
        const rowWasMoved = this.clientSideRowModel.ensureRowsAtPixel(rowNodes, pixel, increment);
        if (rowWasMoved) {
            this.focusService.clearFocusedCell();
            if (this.rangeService) {
                this.rangeService.removeAllCellRanges();
            }
        }
    }
    addRowDropZone(params) {
        if (!params.getContainer()) {
            doOnce(() => console.warn('AG Grid: addRowDropZone - A container target needs to be provided'), 'add-drop-zone-empty-target');
            return;
        }
        if (this.dragAndDropService.findExternalZone(params)) {
            console.warn('AG Grid: addRowDropZone - target already exists in the list of DropZones. Use `removeRowDropZone` before adding it again.');
            return;
        }
        let processedParams = {
            getContainer: params.getContainer
        };
        if (params.fromGrid) {
            params.fromGrid = undefined;
            processedParams = params;
        }
        else {
            if (params.onDragEnter) {
                processedParams.onDragEnter = (e) => {
                    params.onDragEnter(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_ENTER, e));
                };
            }
            if (params.onDragLeave) {
                processedParams.onDragLeave = (e) => {
                    params.onDragLeave(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_LEAVE, e));
                };
            }
            if (params.onDragging) {
                processedParams.onDragging = (e) => {
                    params.onDragging(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_MOVE, e));
                };
            }
            if (params.onDragStop) {
                processedParams.onDragStop = (e) => {
                    params.onDragStop(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_END, e));
                };
            }
        }
        this.dragAndDropService.addDropTarget(Object.assign({ isInterestedIn: (type) => type === DragSourceType.RowDrag, getIconName: () => DragAndDropService.ICON_MOVE, external: true }, processedParams));
    }
    getRowDropZone(events) {
        const getContainer = this.getContainer.bind(this);
        const onDragEnter = this.onDragEnter.bind(this);
        const onDragLeave = this.onDragLeave.bind(this);
        const onDragging = this.onDragging.bind(this);
        const onDragStop = this.onDragStop.bind(this);
        if (!events) {
            return { getContainer, onDragEnter, onDragLeave, onDragging, onDragStop, /* @private */ fromGrid: true };
        }
        return {
            getContainer,
            onDragEnter: events.onDragEnter
                ? ((e) => {
                    onDragEnter(e);
                    events.onDragEnter(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_ENTER, e));
                })
                : onDragEnter,
            onDragLeave: events.onDragLeave
                ? ((e) => {
                    onDragLeave(e);
                    events.onDragLeave(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_LEAVE, e));
                })
                : onDragLeave,
            onDragging: events.onDragging
                ? ((e) => {
                    onDragging(e);
                    events.onDragging(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_MOVE, e));
                })
                : onDragging,
            onDragStop: events.onDragStop
                ? ((e) => {
                    onDragStop(e);
                    events.onDragStop(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_END, e));
                })
                : onDragStop,
            fromGrid: true /* @private */
        };
    }
    draggingToRowDragEvent(type, draggingEvent) {
        const yNormalised = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        const mouseIsPastLastRow = yNormalised > this.paginationProxy.getCurrentPageHeight();
        let overIndex = -1;
        let overNode;
        if (!mouseIsPastLastRow) {
            overIndex = this.rowModel.getRowIndexAtPixel(yNormalised);
            overNode = this.rowModel.getRow(overIndex);
        }
        let vDirectionString;
        switch (draggingEvent.vDirection) {
            case VerticalDirection.Down:
                vDirectionString = 'down';
                break;
            case VerticalDirection.Up:
                vDirectionString = 'up';
                break;
            default:
                vDirectionString = null;
                break;
        }
        const event = {
            type: type,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            event: draggingEvent.event,
            node: draggingEvent.dragItem.rowNode,
            nodes: draggingEvent.dragItem.rowNodes,
            overIndex: overIndex,
            overNode: overNode,
            y: yNormalised,
            vDirection: vDirectionString
        };
        return event;
    }
    dispatchGridEvent(type, draggingEvent) {
        const event = this.draggingToRowDragEvent(type, draggingEvent);
        this.eventService.dispatchEvent(event);
    }
    onDragLeave(draggingEvent) {
        this.dispatchGridEvent(Events.EVENT_ROW_DRAG_LEAVE, draggingEvent);
        this.stopDragging(draggingEvent);
        if (this.gridOptionsWrapper.isRowDragManaged()) {
            this.clearRowHighlight();
        }
        if (this.isFromThisGrid(draggingEvent)) {
            this.isMultiRowDrag = false;
        }
    }
    onDragStop(draggingEvent) {
        this.dispatchGridEvent(Events.EVENT_ROW_DRAG_END, draggingEvent);
        this.stopDragging(draggingEvent);
        if (this.gridOptionsWrapper.isRowDragManaged() &&
            (this.gridOptionsWrapper.isSuppressMoveWhenRowDragging() || !this.isFromThisGrid(draggingEvent)) &&
            !this.isDropZoneWithinThisGrid(draggingEvent)) {
            this.moveRowAndClearHighlight(draggingEvent);
        }
    }
    stopDragging(draggingEvent) {
        this.autoScrollService.ensureCleared();
        this.getRowNodes(draggingEvent).forEach(rowNode => {
            rowNode.setDragging(false);
        });
    }
}
__decorate([
    Autowired('dragAndDropService')
], RowDragFeature.prototype, "dragAndDropService", void 0);
__decorate([
    Autowired('rowModel')
], RowDragFeature.prototype, "rowModel", void 0);
__decorate([
    Autowired('paginationProxy')
], RowDragFeature.prototype, "paginationProxy", void 0);
__decorate([
    Autowired('columnModel')
], RowDragFeature.prototype, "columnModel", void 0);
__decorate([
    Autowired('focusService')
], RowDragFeature.prototype, "focusService", void 0);
__decorate([
    Autowired('sortController')
], RowDragFeature.prototype, "sortController", void 0);
__decorate([
    Autowired('filterManager')
], RowDragFeature.prototype, "filterManager", void 0);
__decorate([
    Autowired('selectionService')
], RowDragFeature.prototype, "selectionService", void 0);
__decorate([
    Autowired('mouseEventService')
], RowDragFeature.prototype, "mouseEventService", void 0);
__decorate([
    Autowired('ctrlsService')
], RowDragFeature.prototype, "ctrlsService", void 0);
__decorate([
    Optional('rangeService')
], RowDragFeature.prototype, "rangeService", void 0);
__decorate([
    PostConstruct
], RowDragFeature.prototype, "postConstruct", null);
