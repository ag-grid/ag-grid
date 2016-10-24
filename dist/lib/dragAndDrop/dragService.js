/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var context_1 = require("../context/context");
var logger_1 = require("../logger");
var utils_1 = require("../utils");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
/** Adds drag listening onto an element. In ag-Grid this is used twice, first is resizing columns,
 * second is moving the columns and column groups around (ie the 'drag' part of Drag and Drop. */
var DragService = (function () {
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
        this.eBody = document.querySelector('body');
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
            element.removeEventListener('touchstart', touchStartListener);
        }
    };
    DragService.prototype.removeDragSource = function (params) {
        var dragSourceAndListener = utils_1.Utils.find(this.dragSources, function (item) { return item.dragSource === params; });
        if (!dragSourceAndListener) {
            return;
        }
        this.removeListener(dragSourceAndListener);
        utils_1.Utils.removeFromArray(this.dragSources, dragSourceAndListener);
    };
    DragService.prototype.setNoSelectToBody = function (noSelect) {
        if (utils_1.Utils.exists(this.eBody)) {
            utils_1.Utils.addOrRemoveCssClass(this.eBody, 'ag-body-no-select', noSelect);
        }
    };
    DragService.prototype.addDragSource = function (params, includeTouch) {
        if (includeTouch === void 0) { includeTouch = false; }
        var mouseListener = this.onMouseDown.bind(this, params);
        params.eElement.addEventListener('mousedown', mouseListener);
        var touchListener = null;
        if (includeTouch) {
            touchListener = this.onTouchStart.bind(this, params);
            params.eElement.addEventListener('touchstart', touchListener);
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
        params.eElement.addEventListener('touchmove', this.onTouchMoveListener);
        params.eElement.addEventListener('touchend', this.onTouchEndListener);
        params.eElement.addEventListener('touchcancel', this.onTouchEndListener);
        this.dragEndFunctions.push(function () {
            params.eElement.removeEventListener('touchmove', _this.onTouchMoveListener);
            params.eElement.removeEventListener('touchend', _this.onTouchEndListener);
            params.eElement.removeEventListener('touchcancel', _this.onTouchEndListener);
        });
        // see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onCommonMove(touch, this.touchStart);
        }
    };
    // gets called whenever mouse down on any drag source
    DragService.prototype.onMouseDown = function (params, mouseEvent) {
        var _this = this;
        // only interested in left button clicks
        if (mouseEvent.button !== 0) {
            return;
        }
        this.currentDragParams = params;
        this.dragging = false;
        this.mouseEventLastTime = mouseEvent;
        this.mouseStartEvent = mouseEvent;
        // we temporally add these listeners, for the duration of the drag, they
        // are removed in mouseup handling.
        document.addEventListener('mousemove', this.onMouseMoveListener);
        document.addEventListener('mouseup', this.onMouseUpListener);
        this.dragEndFunctions.push(function () {
            document.removeEventListener('mousemove', _this.onMouseMoveListener);
            document.removeEventListener('mouseup', _this.onMouseUpListener);
        });
        // see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onMouseMove(mouseEvent);
        }
    };
    // returns true if the event is close to the original event by X pixels either vertically or horizontally.
    // we only start dragging after X pixels so this allows us to know if we should start dragging yet.
    DragService.prototype.isEventNearStartEvent = function (currentEvent, startEvent) {
        // by default, we wait 4 pixels before starting the drag
        var requiredPixelDiff = utils_1.Utils.exists(this.currentDragParams.dragStartPixels) ? this.currentDragParams.dragStartPixels : 4;
        return utils_1.Utils.areEventsNear(currentEvent, startEvent, requiredPixelDiff);
    };
    DragService.prototype.getFirstActiveTouch = function (touchList) {
        for (var i = 0; i < touchList.length; i++) {
            var matches = touchList[i].identifier === this.touchStart.identifier;
            if (matches) {
                return touchList[i];
            }
        }
        return null;
    };
    DragService.prototype.onCommonMove = function (currentEvent, startEvent) {
        if (!this.dragging) {
            // if mouse hasn't travelled from the start position enough, do nothing
            var toEarlyToDrag = !this.dragging && this.isEventNearStartEvent(currentEvent, startEvent);
            if (toEarlyToDrag) {
                return;
            }
            else {
                // alert(`started`);
                this.dragging = true;
                this.eventService.dispatchEvent(events_1.Events.EVENT_DRAG_STARTED);
                this.currentDragParams.onDragStart(startEvent);
                this.setNoSelectToBody(true);
            }
        }
        this.currentDragParams.onDragging(currentEvent);
    };
    DragService.prototype.onTouchMove = function (touchEvent) {
        var touch = this.getFirstActiveTouch(touchEvent.touches);
        if (!touch) {
            return;
        }
        // this.___statusBar.setInfoText(Math.random() + ' onTouchMove preventDefault stopPropagation');
        this.onCommonMove(touch, this.touchStart);
    };
    // only gets called after a mouse down - as this is only added after mouseDown
    // and is removed when mouseUp happens
    DragService.prototype.onMouseMove = function (mouseEvent) {
        this.onCommonMove(mouseEvent, this.mouseStartEvent);
    };
    DragService.prototype.onTouchUp = function (touchEvent) {
        var touch = this.getFirstActiveTouch(touchEvent.targetTouches);
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
        // var tap = !this.dragging;
        // var tapTarget = this.currentDragParams.eElement;
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
            this.eventService.dispatchEvent(events_1.Events.EVENT_DRAG_STOPPED);
        }
        this.setNoSelectToBody(false);
        this.mouseStartEvent = null;
        this.mouseEventLastTime = null;
        this.touchStart = null;
        this.touchLastTime = null;
        this.currentDragParams = null;
        this.dragEndFunctions.forEach(function (func) { return func(); });
        this.dragEndFunctions.length = 0;
    };
    __decorate([
        context_1.Autowired('loggerFactory'), 
        __metadata('design:type', logger_1.LoggerFactory)
    ], DragService.prototype, "loggerFactory", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], DragService.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], DragService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], DragService.prototype, "init", null);
    __decorate([
        context_1.PreDestroy, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], DragService.prototype, "destroy", null);
    DragService = __decorate([
        context_1.Bean('dragService'), 
        __metadata('design:paramtypes', [])
    ], DragService);
    return DragService;
})();
exports.DragService = DragService;
