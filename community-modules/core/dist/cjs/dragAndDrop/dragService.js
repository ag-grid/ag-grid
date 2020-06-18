/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var events_1 = require("../events");
var utils_1 = require("../utils");
var beanStub_1 = require("../context/beanStub");
/** Adds drag listening onto an element. In ag-Grid this is used twice, first is resizing columns,
 * second is moving the columns and column groups around (ie the 'drag' part of Drag and Drop. */
var DragService = /** @class */ (function (_super) {
    __extends(DragService, _super);
    function DragService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dragEndFunctions = [];
        _this.dragSources = [];
        return _this;
    }
    DragService.prototype.init = function () {
        this.logger = this.loggerFactory.create('DragService');
    };
    DragService.prototype.removeAllListeners = function () {
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
        if (touchEvent.cancelable) {
            touchEvent.preventDefault();
        }
        var touchMoveEvent = function (e) { return _this.onTouchMove(e, params.eElement); };
        var touchEndEvent = function (e) { return _this.onTouchUp(e, params.eElement); };
        var target = params.eElement;
        var events = [
            { target: target, type: 'touchmove', listener: touchMoveEvent, options: { passive: true } },
            { target: target, type: 'touchend', listener: touchEndEvent, options: { passive: true } },
            { target: target, type: 'touchcancel', listener: touchEndEvent, options: { passive: true } }
        ];
        // temporally add these listeners, for the duration of the drag
        this.addTemporaryEvents(events);
        // see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onCommonMove(touch, this.touchStart, params.eElement);
        }
    };
    // gets called whenever mouse down on any drag source
    DragService.prototype.onMouseDown = function (params, mouseEvent) {
        var _this = this;
        var e = mouseEvent;
        if (params.skipMouseEvent && params.skipMouseEvent(mouseEvent)) {
            return;
        }
        // if there are two elements with parent / child relationship, and both are draggable,
        // when we drag the child, we should NOT drag the parent. an example of this is row moving
        // and range selection - row moving should get preference when use drags the rowDrag component.
        if (e._alreadyProcessedByDragService) {
            return;
        }
        e._alreadyProcessedByDragService = true;
        // only interested in left button clicks
        if (mouseEvent.button !== 0) {
            return;
        }
        this.currentDragParams = params;
        this.dragging = false;
        this.mouseStartEvent = mouseEvent;
        var eDocument = this.gridOptionsWrapper.getDocument();
        this.setNoSelectToBody(true);
        var mouseMoveEvent = function (e, el) { return _this.onMouseMove(e, params.eElement); };
        var mouseUpEvent = function (e, el) { return _this.onMouseUp(e, params.eElement); };
        var contextEvent = function (e) { return e.preventDefault(); };
        var target = eDocument;
        var events = [
            { target: target, type: 'mousemove', listener: mouseMoveEvent },
            { target: target, type: 'mouseup', listener: mouseUpEvent },
            { target: target, type: 'contextmenu', listener: contextEvent }
        ];
        // temporally add these listeners, for the duration of the drag
        this.addTemporaryEvents(events);
        //see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onMouseMove(mouseEvent, params.eElement);
        }
    };
    DragService.prototype.addTemporaryEvents = function (events) {
        events.forEach(function (currentEvent) {
            var target = currentEvent.target, type = currentEvent.type, listener = currentEvent.listener, options = currentEvent.options;
            target.addEventListener(type, listener, options);
        });
        this.dragEndFunctions.push(function () {
            events.forEach(function (currentEvent) {
                var target = currentEvent.target, type = currentEvent.type, listener = currentEvent.listener, options = currentEvent.options;
                target.removeEventListener(type, listener, options);
            });
        });
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
    DragService.prototype.onCommonMove = function (currentEvent, startEvent, el) {
        if (!this.dragging) {
            // if mouse hasn't travelled from the start position enough, do nothing
            if (!this.dragging && this.isEventNearStartEvent(currentEvent, startEvent)) {
                return;
            }
            this.dragging = true;
            var event_1 = {
                type: events_1.Events.EVENT_DRAG_STARTED,
                api: this.gridApi,
                columnApi: this.columnApi,
                target: el
            };
            this.eventService.dispatchEvent(event_1);
            this.currentDragParams.onDragStart(startEvent);
        }
        this.currentDragParams.onDragging(currentEvent);
    };
    DragService.prototype.onTouchMove = function (touchEvent, el) {
        var touch = this.getFirstActiveTouch(touchEvent.touches);
        if (!touch) {
            return;
        }
        // this.___statusPanel.setInfoText(Math.random() + ' onTouchMove preventDefault stopPropagation');
        // if we don't preview default, then the browser will try and do it's own touch stuff,
        // like do 'back button' (chrome does this) or scroll the page (eg drag column could  be confused
        // with scroll page in the app)
        // touchEvent.preventDefault();
        this.onCommonMove(touch, this.touchStart, el);
    };
    // only gets called after a mouse down - as this is only added after mouseDown
    // and is removed when mouseUp happens
    DragService.prototype.onMouseMove = function (mouseEvent, el) {
        this.onCommonMove(mouseEvent, this.mouseStartEvent, el);
    };
    DragService.prototype.onTouchUp = function (touchEvent, el) {
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
        this.onUpCommon(touch, el);
        // if tap, tell user
        // console.log(`${Math.random()} tap = ${tap}`);
        // if (tap) {
        //     tapTarget.click();
        // }
    };
    DragService.prototype.onMouseUp = function (mouseEvent, el) {
        this.onUpCommon(mouseEvent, el);
    };
    DragService.prototype.onUpCommon = function (eventOrTouch, el) {
        if (this.dragging) {
            this.dragging = false;
            this.currentDragParams.onDragStop(eventOrTouch);
            var event_2 = {
                type: events_1.Events.EVENT_DRAG_STOPPED,
                api: this.gridApi,
                columnApi: this.columnApi,
                target: el
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
        context_1.Autowired('loggerFactory')
    ], DragService.prototype, "loggerFactory", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], DragService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], DragService.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], DragService.prototype, "gridApi", void 0);
    __decorate([
        context_1.PostConstruct
    ], DragService.prototype, "init", null);
    __decorate([
        context_1.PreDestroy
    ], DragService.prototype, "removeAllListeners", null);
    DragService = __decorate([
        context_1.Bean('dragService')
    ], DragService);
    return DragService;
}(beanStub_1.BeanStub));
exports.DragService = DragService;

//# sourceMappingURL=dragService.js.map
