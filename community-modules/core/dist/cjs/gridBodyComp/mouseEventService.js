/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
var context_2 = require("../context/context");
var utils_1 = require("../utils");
var constants_1 = require("../constants/constants");
var beanStub_1 = require("../context/beanStub");
var event_1 = require("../utils/event");
var generic_1 = require("../utils/generic");
var MouseEventService = /** @class */ (function (_super) {
    __extends(MouseEventService, _super);
    function MouseEventService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gridInstanceId = MouseEventService_1.gridInstanceSequence.next();
        return _this;
    }
    MouseEventService_1 = MouseEventService;
    // we put the instance id onto the main DOM element. this is used for events, when grids are inside grids,
    // so the grid can work out if the even came from this grid or a grid inside this one. see the ctrl+v logic
    // for where this is used.
    MouseEventService.prototype.stampTopLevelGridCompWithGridInstance = function (eGridDiv) {
        eGridDiv[MouseEventService_1.GRID_DOM_KEY] = this.gridInstanceId;
    };
    MouseEventService.prototype.getRenderedCellForEvent = function (event) {
        return event_1.getComponentForEvent(this.gridOptionsWrapper, event, 'cellComp');
    };
    // walks the path of the event, and returns true if this grid is the first one that it finds. if doing
    // master / detail grids, and a child grid is found, then it returns false. this stops things like copy/paste
    // getting executed on many grids at the same time.
    MouseEventService.prototype.isEventFromThisGrid = function (event) {
        var res = this.isElementInThisGrid(event.target);
        return res;
    };
    MouseEventService.prototype.isElementInThisGrid = function (element) {
        var pointer = element;
        while (pointer) {
            var instanceId = pointer[MouseEventService_1.GRID_DOM_KEY];
            if (generic_1.exists(instanceId)) {
                var eventFromThisGrid = instanceId === this.gridInstanceId;
                return eventFromThisGrid;
            }
            pointer = pointer.parentElement;
        }
        return false;
    };
    MouseEventService.prototype.getCellPositionForEvent = function (event) {
        var cellComp = this.getRenderedCellForEvent(event);
        return cellComp ? cellComp.getCellPosition() : null;
    };
    MouseEventService.prototype.getNormalisedPosition = function (event) {
        var gridPanelHasScrolls = this.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_NORMAL;
        var e = event;
        var x;
        var y;
        if (e.clientX != null || e.clientY != null) {
            x = e.clientX;
            y = e.clientY;
        }
        else {
            x = e.x;
            y = e.y;
        }
        if (gridPanelHasScrolls) {
            var gridBodyCon = this.controllersService.getGridBodyController();
            var vRange = gridBodyCon.getScrollFeature().getVScrollPosition();
            var hRange = gridBodyCon.getScrollFeature().getHScrollPosition();
            x += hRange.left;
            y += vRange.top;
        }
        return { x: x, y: y };
    };
    var MouseEventService_1;
    MouseEventService.gridInstanceSequence = new utils_1.NumberSequence();
    MouseEventService.GRID_DOM_KEY = '__ag_grid_instance';
    __decorate([
        context_2.Autowired('controllersService')
    ], MouseEventService.prototype, "controllersService", void 0);
    MouseEventService = MouseEventService_1 = __decorate([
        context_1.Bean('mouseEventService')
    ], MouseEventService);
    return MouseEventService;
}(beanStub_1.BeanStub));
exports.MouseEventService = MouseEventService;

//# sourceMappingURL=mouseEventService.js.map
