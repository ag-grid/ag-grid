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
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var columnController_1 = require("../columnController/columnController");
var columnApi_1 = require("../columnController/columnApi");
var gridApi_1 = require("../gridApi");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
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
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], ScrollVisibleService.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], ScrollVisibleService.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], ScrollVisibleService.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], ScrollVisibleService.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ScrollVisibleService.prototype, "gridOptionsWrapper", void 0);
    ScrollVisibleService = __decorate([
        context_1.Bean('scrollVisibleService')
    ], ScrollVisibleService);
    return ScrollVisibleService;
}());
exports.ScrollVisibleService = ScrollVisibleService;
