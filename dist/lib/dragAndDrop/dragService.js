/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.1.2
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
/** Adds drag listening onto an element. In ag-Grid this is used twice, first is resizing columns,
 * second is moving the columns and column groups around (ie the 'drag' part of Drag and Drop. */
var DragService = (function () {
    function DragService() {
        this.onMouseUpListener = this.onMouseUp.bind(this);
        this.onMouseMoveListener = this.onMouseMove.bind(this);
        this.destroyFunctions = [];
    }
    DragService.prototype.init = function () {
        this.logger = this.loggerFactory.create('DragService');
        this.eBody = document.querySelector('body');
    };
    DragService.prototype.destroy = function () {
        this.destroyFunctions.forEach(function (func) { return func(); });
    };
    DragService.prototype.setNoSelectToBody = function (noSelect) {
        if (utils_1.Utils.exists(this.eBody)) {
            utils_1.Utils.addOrRemoveCssClass(this.eBody, 'ag-body-no-select', noSelect);
        }
    };
    DragService.prototype.addDragSource = function (params) {
        var listener = this.onMouseDown.bind(this, params);
        params.eElement.addEventListener('mousedown', listener);
        this.destroyFunctions.push(function () { return params.eElement.removeEventListener('mousedown', listener); });
    };
    // gets called whenever mouse down on any drag source
    DragService.prototype.onMouseDown = function (params, mouseEvent) {
        // only interested in left button clicks
        if (mouseEvent.button !== 0) {
            return;
        }
        this.currentDragParams = params;
        this.dragging = false;
        this.eventLastTime = mouseEvent;
        this.dragStartEvent = mouseEvent;
        // we temporally add these listeners, for the duration of the drag, they
        // are removed in mouseup handling.
        document.addEventListener('mousemove', this.onMouseMoveListener);
        document.addEventListener('mouseup', this.onMouseUpListener);
        // see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onMouseMove(mouseEvent);
        }
    };
    // returns true if the event is close to the original event by X pixels either vertically or horizontally.
    // we only start dragging after X pixels so this allows us to know if we should start dragging yet.
    DragService.prototype.isEventNearStartEvent = function (event) {
        // by default, we wait 4 pixels before starting the drag
        var requiredPixelDiff = utils_1.Utils.exists(this.currentDragParams.dragStartPixels) ? this.currentDragParams.dragStartPixels : 4;
        if (requiredPixelDiff === 0) {
            return false;
        }
        var diffX = Math.abs(event.clientX - this.dragStartEvent.clientX);
        var diffY = Math.abs(event.clientY - this.dragStartEvent.clientY);
        return Math.max(diffX, diffY) <= requiredPixelDiff;
    };
    // only gets called after a mouse down - as this is only added after mouseDown
    // and is removed when mouseUp happens
    DragService.prototype.onMouseMove = function (mouseEvent) {
        if (!this.dragging) {
            // if mouse hasn't travelled from the start position enough, do nothing
            var toEarlyToDrag = !this.dragging && this.isEventNearStartEvent(mouseEvent);
            if (toEarlyToDrag) {
                return;
            }
            else {
                this.dragging = true;
                this.eventService.dispatchEvent(events_1.Events.EVENT_DRAG_STARTED);
                this.currentDragParams.onDragStart(this.dragStartEvent);
                this.setNoSelectToBody(true);
            }
        }
        this.currentDragParams.onDragging(mouseEvent);
    };
    DragService.prototype.onMouseUp = function (mouseEvent) {
        document.removeEventListener('mouseup', this.onMouseUpListener);
        document.removeEventListener('mousemove', this.onMouseMoveListener);
        if (this.dragging) {
            this.currentDragParams.onDragStop(mouseEvent);
        }
        this.dragStartEvent = null;
        this.eventLastTime = null;
        this.dragging = false;
        this.setNoSelectToBody(false);
        this.eventService.dispatchEvent(events_1.Events.EVENT_DRAG_STOPPED);
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
