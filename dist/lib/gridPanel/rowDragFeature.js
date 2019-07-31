/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var context_1 = require("../context/context");
var focusedCellController_1 = require("../focusedCellController");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var eventService_1 = require("../eventService");
var eventKeys_1 = require("../eventKeys");
var constants_1 = require("../constants");
var RowDragFeature = /** @class */ (function () {
    function RowDragFeature(eContainer, gridPanel) {
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
    RowDragFeature.prototype.onDragEnter = function (draggingEvent) {
        // when entering, we fire the enter event, then in onEnterOrDragging,
        // we also fire the move event. so we get both events when entering.
        this.dispatchEvent(eventKeys_1.Events.EVENT_ROW_DRAG_ENTER, draggingEvent);
        this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_MOVE);
        draggingEvent.dragItem.rowNode.setDragging(true);
        this.onEnterOrDragging(draggingEvent);
    };
    RowDragFeature.prototype.onDragging = function (draggingEvent) {
        this.onEnterOrDragging(draggingEvent);
    };
    RowDragFeature.prototype.onEnterOrDragging = function (draggingEvent) {
        // this event is fired for enter and move
        this.dispatchEvent(eventKeys_1.Events.EVENT_ROW_DRAG_MOVE, draggingEvent);
        this.lastDraggingEvent = draggingEvent;
        var pixel = this.normaliseForScroll(draggingEvent.y);
        var managedDrag = this.gridOptionsWrapper.isRowDragManaged();
        if (managedDrag) {
            this.doManagedDrag(draggingEvent, pixel);
        }
        this.checkCenterForScrolling(pixel);
    };
    RowDragFeature.prototype.doManagedDrag = function (draggingEvent, pixel) {
        var rowNode = draggingEvent.dragItem.rowNode;
        var rowWasMoved = this.clientSideRowModel.ensureRowAtPixel(rowNode, pixel);
        if (rowWasMoved) {
            this.focusedCellController.clearFocusedCell();
            if (this.rangeController) {
                this.rangeController.removeAllCellRanges();
            }
        }
    };
    RowDragFeature.prototype.normaliseForScroll = function (pixel) {
        var gridPanelHasScrolls = this.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_NORMAL;
        if (gridPanelHasScrolls) {
            var pixelRange = this.gridPanel.getVScrollPosition();
            return pixel + pixelRange.top;
        }
        else {
            return pixel;
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
        var yNormalised = this.normaliseForScroll(draggingEvent.y);
        var overIndex = -1;
        var overNode = null;
        var mouseIsPastLastRow = yNormalised > this.rowModel.getCurrentPageHeight();
        if (!mouseIsPastLastRow) {
            overIndex = this.rowModel.getRowIndexAtPixel(yNormalised);
            overNode = this.rowModel.getRow(overIndex);
        }
        var vDirectionString;
        switch (draggingEvent.vDirection) {
            case dragAndDropService_1.VDirection.Down:
                vDirectionString = 'down';
                break;
            case dragAndDropService_1.VDirection.Up:
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
    };
    RowDragFeature.prototype.onDragStop = function (draggingEvent) {
        this.dispatchEvent(eventKeys_1.Events.EVENT_ROW_DRAG_END, draggingEvent);
        this.stopDragging(draggingEvent);
    };
    RowDragFeature.prototype.stopDragging = function (draggingEvent) {
        this.ensureIntervalCleared();
        draggingEvent.dragItem.rowNode.setDragging(false);
    };
    __decorate([
        context_1.Autowired('dragAndDropService'),
        __metadata("design:type", dragAndDropService_1.DragAndDropService)
    ], RowDragFeature.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], RowDragFeature.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'),
        __metadata("design:type", focusedCellController_1.FocusedCellController)
    ], RowDragFeature.prototype, "focusedCellController", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], RowDragFeature.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Optional('rangeController'),
        __metadata("design:type", Object)
    ], RowDragFeature.prototype, "rangeController", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], RowDragFeature.prototype, "eventService", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], RowDragFeature.prototype, "postConstruct", null);
    return RowDragFeature;
}());
exports.RowDragFeature = RowDragFeature;
