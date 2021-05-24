/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { Bean, PreDestroy, Autowired, PostConstruct } from "../context/context";
import { Events } from "../events";
import { BeanStub } from "../context/beanStub";
import { find, exists } from "../utils/generic";
import { removeFromArray } from "../utils/array";
import { addOrRemoveCssClass } from "../utils/dom";
import { areEventsNear } from "../utils/mouse";
/** Adds drag listening onto an element. In AG Grid this is used twice, first is resizing columns,
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
        var dragSourceAndListener = find(this.dragSources, function (item) { return item.dragSource === params; });
        if (!dragSourceAndListener) {
            return;
        }
        this.removeListener(dragSourceAndListener);
        removeFromArray(this.dragSources, dragSourceAndListener);
    };
    DragService.prototype.setNoSelectToBody = function (noSelect) {
        var eDocument = this.gridOptionsWrapper.getDocument();
        var eBody = eDocument.querySelector('body');
        if (exists(eBody)) {
            // when we drag the mouse in AG Grid, this class gets added / removed from the body, so that
            // the mouse isn't selecting text when dragging.
            addOrRemoveCssClass(eBody, 'ag-unselectable', noSelect);
        }
    };
    DragService.prototype.isDragging = function () {
        return this.dragging;
    };
    DragService.prototype.addDragSource = function (params, includeTouch) {
        if (includeTouch === void 0) { includeTouch = false; }
        var mouseListener = this.onMouseDown.bind(this, params);
        params.eElement.addEventListener('mousedown', mouseListener);
        var touchListener = null;
        var suppressTouch = this.gridOptionsWrapper.isSuppressTouch();
        if (includeTouch && !suppressTouch) {
            touchListener = this.onTouchStart.bind(this, params);
            params.eElement.addEventListener('touchstart', touchListener, { passive: true });
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
        var touchMoveEvent = function (e) { return _this.onTouchMove(e, params.eElement); };
        var touchEndEvent = function (e) { return _this.onTouchUp(e, params.eElement); };
        var documentTouchMove = function (e) { if (e.cancelable) {
            e.preventDefault();
        } };
        var target = params.eElement;
        var events = [
            // Prevents the page document from moving while we are dragging items around.
            // preventDefault needs to be called in the touchmove listener and never inside the
            // touchstart, because using touchstart causes the click event to be cancelled on touch devices.
            { target: document, type: 'touchmove', listener: documentTouchMove, options: { passive: false } },
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
        var mouseMoveEvent = function (event) { return _this.onMouseMove(event, params.eElement); };
        var mouseUpEvent = function (event) { return _this.onMouseUp(event, params.eElement); };
        var contextEvent = function (event) { return event.preventDefault(); };
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
        var requiredPixelDiff = exists(dragStartPixels) ? dragStartPixels : 4;
        return areEventsNear(currentEvent, startEvent, requiredPixelDiff);
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
                type: Events.EVENT_DRAG_STARTED,
                api: this.gridApi,
                columnApi: this.columnApi,
                target: el
            };
            this.eventService.dispatchEvent(event_1);
            this.currentDragParams.onDragStart(startEvent);
            // we need ONE drag action at the startEvent, so that we are guaranteed the drop target
            // at the start gets notified. this is because the drag can start outside of the element
            // that started it, as the mouse is allowed drag away from the mouse down before it's
            // considered a drag (the isEventNearStartEvent() above). if we didn't do this, then
            // it would be possible to click a column by the edge, then drag outside of the drop zone
            // in less than 4 pixels and the drag officially starts outside of the header but the header
            // wouldn't be notified of the dragging.
            this.currentDragParams.onDragging(startEvent);
        }
        this.currentDragParams.onDragging(currentEvent);
    };
    DragService.prototype.onTouchMove = function (touchEvent, el) {
        var touch = this.getFirstActiveTouch(touchEvent.touches);
        if (!touch) {
            return;
        }
        // this.___statusPanel.setInfoText(Math.random() + ' onTouchMove preventDefault stopPropagation');
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
                type: Events.EVENT_DRAG_STOPPED,
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
        Autowired('loggerFactory')
    ], DragService.prototype, "loggerFactory", void 0);
    __decorate([
        Autowired('columnApi')
    ], DragService.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], DragService.prototype, "gridApi", void 0);
    __decorate([
        PostConstruct
    ], DragService.prototype, "init", null);
    __decorate([
        PreDestroy
    ], DragService.prototype, "removeAllListeners", null);
    DragService = __decorate([
        Bean('dragService')
    ], DragService);
    return DragService;
}(BeanStub));
export { DragService };
