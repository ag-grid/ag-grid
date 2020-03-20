/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, PostConstruct } from "../context/context";
import { Autowired } from "../context/context";
import { NumberSequence, _ } from '../utils';
import { Constants } from "../constants";
var MouseEventService = /** @class */ (function () {
    function MouseEventService() {
        this.gridInstanceId = MouseEventService_1.gridInstanceSequence.next();
    }
    MouseEventService_1 = MouseEventService;
    MouseEventService.prototype.init = function () {
        this.stampDomElementWithGridInstance();
    };
    MouseEventService.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    // we put the instance id onto the main DOM element. this is used for events, when grids are inside grids,
    // so the grid can work out if the even came from this grid or a grid inside this one. see the ctrl+v logic
    // for where this is used.
    MouseEventService.prototype.stampDomElementWithGridInstance = function () {
        this.eGridDiv[MouseEventService_1.GRID_DOM_KEY] = this.gridInstanceId;
    };
    MouseEventService.prototype.getRenderedCellForEvent = function (event) {
        return _.getCellCompForEvent(this.gridOptionsWrapper, event);
    };
    // walks the path of the event, and returns true if this grid is the first one that it finds. if doing
    // master / detail grids, and a child grid is found, then it returns false. this stops things like copy/paste
    // getting executed on many grids at the same time.
    MouseEventService.prototype.isEventFromThisGrid = function (event) {
        var path = _.getEventPath(event);
        for (var i = 0; i < path.length; i++) {
            var element = path[i];
            var instanceId = element[MouseEventService_1.GRID_DOM_KEY];
            if (_.exists(instanceId)) {
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
    MouseEventService.prototype.getNormalisedPosition = function (event) {
        var gridPanelHasScrolls = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_NORMAL;
        var x = event.x, y = event.y;
        if (gridPanelHasScrolls) {
            var vRange = this.gridPanel.getVScrollPosition();
            var hRange = this.gridPanel.getHScrollPosition();
            return { x: x + hRange.left, y: y + vRange.top };
        }
        return { x: x, y: y };
    };
    var MouseEventService_1;
    MouseEventService.gridInstanceSequence = new NumberSequence();
    MouseEventService.GRID_DOM_KEY = '__ag_grid_instance';
    __decorate([
        Autowired('gridOptionsWrapper')
    ], MouseEventService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('eGridDiv')
    ], MouseEventService.prototype, "eGridDiv", void 0);
    __decorate([
        PostConstruct
    ], MouseEventService.prototype, "init", null);
    MouseEventService = MouseEventService_1 = __decorate([
        Bean('mouseEventService')
    ], MouseEventService);
    return MouseEventService;
}());
export { MouseEventService };
