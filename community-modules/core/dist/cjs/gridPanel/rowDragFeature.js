/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var context_1 = require("../context/context");
var eventKeys_1 = require("../eventKeys");
var general_1 = require("../utils/general");
var RowDragFeature = /** @class */ (function () {
    function RowDragFeature(eContainer, gridPanel) {
        this.isMultiRowDrag = false;
        this.movingNodes = null;
        this.eContainer = eContainer;
        this.gridPanel = gridPanel;
    }
    RowDragFeature.prototype.postConstruct = function () {
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.clientSideRowModel = this.rowModel;
        }
    };
    RowDragFeature.prototype.getContainer = function () {
        return this.eContainer;
    };
    RowDragFeature.prototype.isInterestedIn = function (type) {
        return type === dragAndDropService_1.DragSourceType.RowDrag;
    };
    RowDragFeature.prototype.getIconName = function () {
        return dragAndDropService_1.DragAndDropService.ICON_MOVE;
    };
    RowDragFeature.prototype.getRowNodes = function (dragginEvent) {
        var enableMultiRowDragging = this.gridOptionsWrapper.isEnableMultiRowDragging();
        var selectedNodes = this.selectionController.getSelectedNodes();
        var currentNode = dragginEvent.dragItem.rowNode;
        if (enableMultiRowDragging && selectedNodes.indexOf(currentNode) !== -1) {
            this.isMultiRowDrag = true;
            return __spreadArrays(selectedNodes);
        }
        return [currentNode];
    };
    RowDragFeature.prototype.onDragEnter = function (draggingEvent) {
        // when entering, we fire the enter event, then in onEnterOrDragging,
        // we also fire the move event. so we get both events when entering.
        this.dispatchEvent(eventKeys_1.Events.EVENT_ROW_DRAG_ENTER, draggingEvent);
        this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_MOVE);
        this.getRowNodes(draggingEvent).forEach(function (rowNode, idx) {
            rowNode.setDragging(true);
        });
        this.onEnterOrDragging(draggingEvent);
    };
    RowDragFeature.prototype.onDragging = function (draggingEvent) {
        this.onEnterOrDragging(draggingEvent);
    };
    RowDragFeature.prototype.onEnterOrDragging = function (draggingEvent) {
        // this event is fired for enter and move
        this.dispatchEvent(eventKeys_1.Events.EVENT_ROW_DRAG_MOVE, draggingEvent);
        this.lastDraggingEvent = draggingEvent;
        var pixel = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        var managedDrag = this.gridOptionsWrapper.isRowDragManaged();
        if (managedDrag) {
            this.doManagedDrag(draggingEvent, pixel);
        }
        this.checkCenterForScrolling(pixel);
    };
    RowDragFeature.prototype.doManagedDrag = function (draggingEvent, pixel) {
        var _this = this;
        var rowNodes = this.movingNodes = [draggingEvent.dragItem.rowNode];
        if (this.isMultiRowDrag) {
            rowNodes = this.movingNodes = __spreadArrays(this.selectionController.getSelectedNodes()).sort(function (a, b) { return _this.getRowIndexNumber(a) - _this.getRowIndexNumber(b); });
        }
        if (this.gridOptionsWrapper.isSuppressMoveWhenRowDragging()) {
            this.clientSideRowModel.highlightRowAtPixel(rowNodes[0], pixel);
        }
        else {
            this.moveRows(rowNodes, pixel);
        }
    };
    RowDragFeature.prototype.getRowIndexNumber = function (rowNode) {
        return parseInt(general_1._.last(rowNode.getRowIndexString().split('-')), 10);
    };
    RowDragFeature.prototype.moveRowAndClearHighlight = function (draggingEvent) {
        var lastHighlightedRowNode = this.clientSideRowModel.getLastHighlightedRowNode();
        var isBelow = lastHighlightedRowNode && lastHighlightedRowNode.highlighted === 'below';
        var pixel = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        var rowNodes = this.movingNodes;
        var increment = isBelow ? 1 : 0;
        rowNodes.forEach(function (rowNode) {
            if (rowNode.rowTop < pixel) {
                increment -= 1;
            }
        });
        this.moveRows(rowNodes, pixel, increment);
        this.clearRowHighlight();
    };
    RowDragFeature.prototype.clearRowHighlight = function () {
        this.clientSideRowModel.highlightRowAtPixel(null);
    };
    RowDragFeature.prototype.moveRows = function (rowNodes, pixel, increment) {
        if (increment === void 0) { increment = 0; }
        var rowWasMoved = this.clientSideRowModel.ensureRowsAtPixel(rowNodes, pixel, increment);
        if (rowWasMoved) {
            this.focusController.clearFocusedCell();
            if (this.rangeController) {
                this.rangeController.removeAllCellRanges();
            }
        }
    };
    RowDragFeature.prototype.checkCenterForScrolling = function (pixel) {
        // scroll if the mouse is within 50px of the grid edge
        var pixelRange = this.gridPanel.getVScrollPosition();
        // console.log(`pixelRange = (${pixelRange.top}, ${pixelRange.bottom})`);
        this.needToMoveUp = pixel < (pixelRange.top + 50);
        this.needToMoveDown = pixel > (pixelRange.bottom - 50);
        // console.log(`needToMoveUp = ${this.needToMoveUp} = pixel < (pixelRange.top + 50) = ${pixel} < (${pixelRange.top} + 50)`);
        // console.log(`needToMoveDown = ${this.needToMoveDown} = pixel < (pixelRange.top + 50) = ${pixel} < (${pixelRange.top} + 50)`);
        if (this.needToMoveUp || this.needToMoveDown) {
            this.ensureIntervalStarted();
        }
        else {
            this.ensureIntervalCleared();
        }
    };
    RowDragFeature.prototype.ensureIntervalStarted = function () {
        if (!this.movingIntervalId) {
            this.intervalCount = 0;
            this.movingIntervalId = window.setInterval(this.moveInterval.bind(this), 100);
        }
    };
    RowDragFeature.prototype.ensureIntervalCleared = function () {
        if (this.moveInterval) {
            window.clearInterval(this.movingIntervalId);
            this.movingIntervalId = null;
        }
    };
    RowDragFeature.prototype.moveInterval = function () {
        // the amounts we move get bigger at each interval, so the speed accelerates, starting a bit slow
        // and getting faster. this is to give smoother user experience. we max at 100px to limit the speed.
        var pixelsToMove;
        this.intervalCount++;
        pixelsToMove = 10 + (this.intervalCount * 5);
        if (pixelsToMove > 100) {
            pixelsToMove = 100;
        }
        var pixelsMoved;
        if (this.needToMoveDown) {
            pixelsMoved = this.gridPanel.scrollVertically(pixelsToMove);
        }
        else if (this.needToMoveUp) {
            pixelsMoved = this.gridPanel.scrollVertically(-pixelsToMove);
        }
        if (pixelsMoved !== 0) {
            this.onDragging(this.lastDraggingEvent);
        }
    };
    // i tried using generics here with this:
    //     public createEvent<T extends RowDragEvent>(type: string, clazz: {new(): T; }, draggingEvent: DraggingEvent) {
    // but it didn't work - i think it's because it only works with classes, and not interfaces, (the events are interfaces)
    RowDragFeature.prototype.dispatchEvent = function (type, draggingEvent) {
        var yNormalised = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        var overIndex = -1;
        var overNode = null;
        var mouseIsPastLastRow = yNormalised > this.rowModel.getCurrentPageHeight();
        if (!mouseIsPastLastRow) {
            overIndex = this.rowModel.getRowIndexAtPixel(yNormalised);
            overNode = this.rowModel.getRow(overIndex);
        }
        var vDirectionString;
        switch (draggingEvent.vDirection) {
            case dragAndDropService_1.VerticalDirection.Down:
                vDirectionString = 'down';
                break;
            case dragAndDropService_1.VerticalDirection.Up:
                vDirectionString = 'up';
                break;
            default:
                vDirectionString = null;
                break;
        }
        var event = {
            type: type,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            event: draggingEvent.event,
            node: draggingEvent.dragItem.rowNode,
            overIndex: overIndex,
            overNode: overNode,
            y: yNormalised,
            vDirection: vDirectionString
        };
        this.eventService.dispatchEvent(event);
    };
    RowDragFeature.prototype.onDragLeave = function (draggingEvent) {
        this.dispatchEvent(eventKeys_1.Events.EVENT_ROW_DRAG_LEAVE, draggingEvent);
        this.stopDragging(draggingEvent);
        this.clearRowHighlight();
    };
    RowDragFeature.prototype.onDragStop = function (draggingEvent) {
        this.dispatchEvent(eventKeys_1.Events.EVENT_ROW_DRAG_END, draggingEvent);
        this.stopDragging(draggingEvent);
        if (this.gridOptionsWrapper.isRowDragManaged() &&
            this.gridOptionsWrapper.isSuppressMoveWhenRowDragging()) {
            this.moveRowAndClearHighlight(draggingEvent);
        }
        this.isMultiRowDrag = false;
        this.movingNodes = null;
    };
    RowDragFeature.prototype.stopDragging = function (draggingEvent) {
        this.ensureIntervalCleared();
        this.getRowNodes(draggingEvent).forEach(function (rowNode, idx) {
            rowNode.setDragging(false);
        });
    };
    __decorate([
        context_1.Autowired('dragAndDropService')
    ], RowDragFeature.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('rowModel')
    ], RowDragFeature.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('focusController')
    ], RowDragFeature.prototype, "focusController", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], RowDragFeature.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('selectionController')
    ], RowDragFeature.prototype, "selectionController", void 0);
    __decorate([
        context_1.Optional('rangeController')
    ], RowDragFeature.prototype, "rangeController", void 0);
    __decorate([
        context_1.Autowired('mouseEventService')
    ], RowDragFeature.prototype, "mouseEventService", void 0);
    __decorate([
        context_1.Autowired('eventService')
    ], RowDragFeature.prototype, "eventService", void 0);
    __decorate([
        context_1.PostConstruct
    ], RowDragFeature.prototype, "postConstruct", null);
    return RowDragFeature;
}());
exports.RowDragFeature = RowDragFeature;

//# sourceMappingURL=rowDragFeature.js.map
