/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var events_1 = require("../events");
var ScrollVisibleService = /** @class */ (function () {
    function ScrollVisibleService() {
    }
    ScrollVisibleService.prototype.setScrollsVisible = function (params) {
        var atLeastOneDifferent = this.horizontalScrollShowing !== params.horizontalScrollShowing ||
            this.verticalScrollShowing !== params.verticalScrollShowing;
        if (atLeastOneDifferent) {
            this.horizontalScrollShowing = params.horizontalScrollShowing;
            this.verticalScrollShowing = params.verticalScrollShowing;
            var event_1 = {
                type: events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    // used by pagination service - to know page height
    ScrollVisibleService.prototype.isHorizontalScrollShowing = function () {
        return this.horizontalScrollShowing;
    };
    // used by header container
    ScrollVisibleService.prototype.isVerticalScrollShowing = function () {
        return this.verticalScrollShowing;
    };
    __decorate([
        context_1.Autowired('eventService')
    ], ScrollVisibleService.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], ScrollVisibleService.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], ScrollVisibleService.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], ScrollVisibleService.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], ScrollVisibleService.prototype, "gridOptionsWrapper", void 0);
    ScrollVisibleService = __decorate([
        context_1.Bean('scrollVisibleService')
    ], ScrollVisibleService);
    return ScrollVisibleService;
}());
exports.ScrollVisibleService = ScrollVisibleService;

//# sourceMappingURL=scrollVisibleService.js.map
