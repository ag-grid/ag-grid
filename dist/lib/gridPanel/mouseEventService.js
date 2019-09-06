/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var context_2 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var utils_1 = require("../utils");
var MouseEventService = /** @class */ (function () {
    function MouseEventService() {
        this.gridInstanceId = MouseEventService_1.gridInstanceSequence.next();
    }
    MouseEventService_1 = MouseEventService;
    MouseEventService.prototype.init = function () {
        this.stampDomElementWithGridInstance();
    };
    // we put the instance id onto the main DOM element. this is used for events, when grids are inside grids,
    // so the grid can work out if the even came from this grid or a grid inside this one. see the ctrl+v logic
    // for where this is used.
    MouseEventService.prototype.stampDomElementWithGridInstance = function () {
        this.eGridDiv[MouseEventService_1.GRID_DOM_KEY] = this.gridInstanceId;
    };
    MouseEventService.prototype.getRenderedCellForEvent = function (event) {
        return utils_1._.getCellCompForEvent(this.gridOptionsWrapper, event);
    };
    // walks the path of the event, and returns true if this grid is the first one that it finds. if doing
    // master / detail grids, and a child grid is found, then it returns false. this stops things like copy/paste
    // getting executed on many grids at the same time.
    MouseEventService.prototype.isEventFromThisGrid = function (event) {
        var path = utils_1._.getEventPath(event);
        for (var i = 0; i < path.length; i++) {
            var element = path[i];
            var instanceId = element[MouseEventService_1.GRID_DOM_KEY];
            if (utils_1._.exists(instanceId)) {
                var eventFromThisGrid = instanceId === this.gridInstanceId;
                return eventFromThisGrid;
            }
        }
        return false;
    };
    MouseEventService.prototype.getCellPositionForEvent = function (event) {
        var cellComp = this.getRenderedCellForEvent(event);
        return cellComp ? cellComp.getCellPosition() : null;
    };
    var MouseEventService_1;
    MouseEventService.gridInstanceSequence = new utils_1.NumberSequence();
    MouseEventService.GRID_DOM_KEY = '__ag_grid_instance';
    __decorate([
        context_2.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], MouseEventService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_2.Autowired('eGridDiv'),
        __metadata("design:type", HTMLElement)
    ], MouseEventService.prototype, "eGridDiv", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MouseEventService.prototype, "init", null);
    MouseEventService = MouseEventService_1 = __decorate([
        context_1.Bean('mouseEventService')
    ], MouseEventService);
    return MouseEventService;
}());
exports.MouseEventService = MouseEventService;
