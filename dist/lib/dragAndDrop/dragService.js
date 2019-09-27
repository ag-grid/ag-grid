/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var context_1 = require("../context/context");
var logger_1 = require("../logger");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnApi_1 = require("../columnController/columnApi");
var gridApi_1 = require("../gridApi");
var utils_1 = require("../utils");
/** Adds drag listening onto an element. In ag-Grid this is used twice, first is resizing columns,
 * second is moving the columns and column groups around (ie the 'drag' part of Drag and Drop. */
var DragService = /** @class */ (function () {
    function DragService() {
        this.onMouseUpListener = this.onMouseUp.bind(this);
        this.onMouseMoveListener = this.onMouseMove.bind(this);
        this.onTouchEndListener = this.onTouchUp.bind(this);
        this.onTouchMoveListener = this.onTouchMove.bind(this);
        this.dragEndFunctions = [];
        this.dragSources = [];
    }
    DragService.prototype.init = function () {
        this.logger = this.loggerFactory.create('DragService');
    };
    DragService.prototype.destroy = function () {
        this.dragSources.forEach(this.removeListener.bind(this));
        this.dragSources.length = 0;
    };
    DragService.prototype.removeListener = function (dragSourceAndListener) {
        var element = dragSourceAndListener.dragSource.eElement;
        var mouseDownListener = dragSourceAndListener.mouseDownListener;
        element.removeEventListener('mousedown', mouseDownListener);
        // remove touch listener only if it exists
        if (dragSourceAndListener.touchEnabled) {
            var touchStartListener = dragSourceAndListener.touchStartListener;
            element.removeEventListener('touchstart', touchStartListener, { passive: true });
        }
    };
    DragService.prototype.removeDragSource = function (params) {
        var dragSourceAndListener = utils_1._.find(this.dragSources, function (item) { return item.dragSource === params; });
        if (!dragSourceAndListener) {
            return;
        }
        this.removeListener(dragSourceAndListener);
        utils_1._.removeFromArray(this.dragSources, dragSourceAndListener);
    };
    DragService.prototype.setNoSelectToBody = function (noSelect) {
        var eDocument = this.gridOptionsWrapper.getDocument();
        var eBody = eDocument.querySelector('body');
        if (utils_1._.exists(eBody)) {
            // when we drag the mouse in ag-Grid, this class gets added / removed from the body, so that
            // the mouse isn't selecting text when dragging.
            utils_1._.addOrRemoveCssClass(eBody, 'ag-unselectable', noSelect);
        }
    };
    DragService.prototype.addDragSource = function (params, includeTouch) {
        if (includeTouch === void 0) { includeTouch = false; }
        var mouseListener = this.onMouseDown.bind(this, params);
        params.eElement.addEventListener('mousedown', mouseListener);
        var touchListener = null;
        var suppressTouch = this.gridOptionsWrapper.isSuppressTouch();
        if (includeTouch && !suppressTouch) {
            touchListener = this.onTouchStart.bind(this, params);
            params.eElement.addEventListener('touchstart', touchListener, { passive: false });
        }
        this.dragSources.push({
            dragSource: params,
            mouseDownListener: mouseListener,
            touchStartListener: touchListener,
            touchEnabled: includeTouch
        });
    };
    // gets called whenever mouse down on any drag source
    DragService.prototype.onTouchStart = function (params, touchEvent) {
        var _this = this;
        this.currentDragParams = params;
        this.dragging = false;
        var touch = touchEvent.touches[0];
        this.touchLastTime = touch;
        this.touchStart = touch;
        touchEvent.preventDefault();
        // we temporally add these listeners, for the duration of the drag, they
        // are removed in touch end handling.
        params.eElement.addEventListener('touchmove', this.onTouchMoveListener, { passive: true });
        params.eElement.addEventListener('touchend', this.onTouchEndListener, { passive: true });
        params.eElement.addEventListener('touchcancel', this.onTouchEndListener, { passive: true });
        this.dragEndFunctions.push(function () {
            params.eElement.removeEventListener('touchmove', _this.onTouchMoveListener, { passive: true });
            params.eElement.removeEventListener('touchend', _this.onTouchEndListener, { passive: true });
            params.eElement.removeEventListener('touchcancel', _this.onTouchEndListener, { passive: true });
        });
        // see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onCommonMove(touch, this.touchStart);
        }
    };
    // gets called whenever mouse down on any drag source
    DragService.prototype.onMouseDown = function (params, mouseEvent) {
        var _this = this;
        // we ignore when shift key is pressed. this is for the range selection, as when
        // user shift-clicks a cell, this should not be interpreted as the start of a drag.
        // if (mouseEvent.shiftKey) { return; }
        if (params.skipMouseEvent) {
            if (params.skipMouseEvent(mouseEvent)) {
                return;
            }
        }
        // if there are two elements with parent / child relationship, and both are draggable,
        // when we drag the child, we should NOT drag the parent. an example of this is row moving
        // and range selection - row moving should get preference when use drags the rowDrag component.
        if (mouseEvent._alreadyProcessedByDragService) {
            return;
        }
        mouseEvent._alreadyProcessedByDragService = true;
        // only interested in left button clicks
        if (mouseEvent.button !== 0) {
            return;
        }
        this.currentDragParams = params;
        this.dragging = false;
        this.mouseStartEvent = mouseEvent;
        var eDocument = this.gridOptionsWrapper.getDocument();
        this.setNoSelectToBody(true);
        // we temporally add these listeners, for the duration of the drag, they
        // are removed in mouseup handling.
        eDocument.addEventListener('mousemove', this.onMouseMoveListener);
        eDocument.addEventListener('mouseup', this.onMouseUpListener);
        this.dragEndFunctions.push(function () {
            eDocument.removeEventListener('mousemove', _this.onMouseMoveListener);
            eDocument.removeEventListener('mouseup', _this.onMouseUpListener);
        });
        //see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onMouseMove(mouseEvent);
        }
    };
    // returns true if the event is close to the original event by X pixels either vertically or horizontally.
    // we only start dragging after X pixels so this allows us to know if we should start dragging yet.
    DragService.prototype.isEventNearStartEvent = function (currentEvent, startEvent) {
        // by default, we wait 4 pixels before starting the drag
        var dragStartPixels = this.currentDragParams.dragStartPixels;
        var requiredPixelDiff = utils_1._.exists(dragStartPixels) ? dragStartPixels : 4;
        return utils_1._.areEventsNear(currentEvent, startEvent, requiredPixelDiff);
    };
    DragService.prototype.getFirstActiveTouch = function (touchList) {
        for (var i = 0; i < touchList.length; i++) {
            if (touchList[i].identifier === this.touchStart.identifier) {
                return touchList[i];
            }
        }
        return null;
    };
    DragService.prototype.onCommonMove = function (currentEvent, startEvent) {
        if (!this.dragging) {
            // if mouse hasn't travelled from the start position enough, do nothing
            if (!this.dragging && this.isEventNearStartEvent(currentEvent, startEvent)) {
                return;
            }
            this.dragging = true;
            var event_1 = {
                type: events_1.Events.EVENT_DRAG_STARTED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_1);
            this.currentDragParams.onDragStart(startEvent);
        }
        this.currentDragParams.onDragging(currentEvent);
    };
    DragService.prototype.onTouchMove = function (touchEvent) {
        var touch = this.getFirstActiveTouch(touchEvent.touches);
        if (!touch) {
            return;
        }
        // this.___statusPanel.setInfoText(Math.random() + ' onTouchMove preventDefault stopPropagation');
        // if we don't preview default, then the browser will try and do it's own touch stuff,
        // like do 'back button' (chrome does this) or scroll the page (eg drag column could  be confused
        // with scroll page in the app)
        // touchEvent.preventDefault();
        this.onCommonMove(touch, this.touchStart);
    };
    // only gets called after a mouse down - as this is only added after mouseDown
    // and is removed when mouseUp happens
    DragService.prototype.onMouseMove = function (mouseEvent) {
        this.onCommonMove(mouseEvent, this.mouseStartEvent);
    };
    DragService.prototype.onTouchUp = function (touchEvent) {
        var touch = this.getFirstActiveTouch(touchEvent.changedTouches);
        // i haven't worked this out yet, but there is no matching touch
        // when we get the touch up event. to get around this, we swap in
        // the last touch. this is a hack to 'get it working' while we
        // figure out what's going on, why we are not getting a touch in
        // current event.
        if (!touch) {
            touch = this.touchLastTime;
        }
        // if mouse was left up before we started to move, then this is a tap.
        // we check this before onUpCommon as onUpCommon resets the dragging
        // let tap = !this.dragging;
        // let tapTarget = this.currentDragParams.eElement;
        this.onUpCommon(touch);
        // if tap, tell user
        // console.log(`${Math.random()} tap = ${tap}`);
        // if (tap) {
        //     tapTarget.click();
        // }
    };
    DragService.prototype.onMouseUp = function (mouseEvent) {
        this.onUpCommon(mouseEvent);
    };
    DragService.prototype.onUpCommon = function (eventOrTouch) {
        if (this.dragging) {
            this.dragging = false;
            this.currentDragParams.onDragStop(eventOrTouch);
            var event_2 = {
                type: events_1.Events.EVENT_DRAG_STOPPED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_2);
        }
        this.setNoSelectToBody(false);
        this.mouseStartEvent = null;
        this.touchStart = null;
        this.touchLastTime = null;
        this.currentDragParams = null;
        this.dragEndFunctions.forEach(function (func) { return func(); });
        this.dragEndFunctions.length = 0;
    };
    __decorate([
        context_1.Autowired('loggerFactory'),
        __metadata("design:type", logger_1.LoggerFactory)
    ], DragService.prototype, "loggerFactory", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], DragService.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], DragService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], DragService.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], DragService.prototype, "gridApi", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DragService.prototype, "init", null);
    __decorate([
        context_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DragService.prototype, "destroy", null);
    DragService = __decorate([
        context_1.Bean('dragService')
    ], DragService);
    return DragService;
}());
exports.DragService = DragService;
