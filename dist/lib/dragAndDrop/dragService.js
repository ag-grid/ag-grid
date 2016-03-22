/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
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
var context_2 = require("../context/context");
var logger_1 = require("../logger");
var context_3 = require("../context/context");
var utils_1 = require('../utils');
var DragService = (function () {
    function DragService() {
        this.onMouseUpListener = this.onMouseUp.bind(this);
        this.onMouseMoveListener = this.onMouseMove.bind(this);
    }
    DragService.prototype.init = function () {
        this.logger = this.loggerFactory.create('HorizontalDragService');
    };
    DragService.prototype.addDragSource = function (params) {
        params.eElement.addEventListener('mousedown', this.onMouseDown.bind(this, params));
    };
    DragService.prototype.onMouseDown = function (params, mouseEvent) {
        // only interested in left button clicks
        if (mouseEvent.button !== 0) {
            return;
        }
        this.currentDragParams = params;
        this.dragging = false;
        this.eventLastTime = mouseEvent;
        this.dragStartEvent = mouseEvent;
        document.addEventListener('mousemove', this.onMouseMoveListener);
        document.addEventListener('mouseup', this.onMouseUpListener);
        // see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onMouseMove(mouseEvent);
        }
    };
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
    DragService.prototype.onMouseMove = function (mouseEvent) {
        if (!this.dragging) {
            // we want to have moved at least 4px before the drag starts
            if (this.isEventNearStartEvent(mouseEvent)) {
                return;
            }
            else {
                this.dragging = true;
                this.currentDragParams.onDragStart(this.dragStartEvent);
            }
        }
        this.currentDragParams.onDragging(mouseEvent);
    };
    DragService.prototype.onMouseUp = function (mouseEvent) {
        this.logger.log('onMouseUp');
        document.removeEventListener('mouseup', this.onMouseUpListener);
        document.removeEventListener('mousemove', this.onMouseMoveListener);
        if (this.dragging) {
            this.currentDragParams.onDragStop(mouseEvent);
        }
        this.dragStartEvent = null;
        this.eventLastTime = null;
        this.dragging = false;
    };
    __decorate([
        context_2.Autowired('loggerFactory'), 
        __metadata('design:type', logger_1.LoggerFactory)
    ], DragService.prototype, "loggerFactory", void 0);
    __decorate([
        context_3.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], DragService.prototype, "init", null);
    DragService = __decorate([
        context_1.Bean('dragService'), 
        __metadata('design:paramtypes', [])
    ], DragService);
    return DragService;
})();
exports.DragService = DragService;
