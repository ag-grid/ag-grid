/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var beanStub_1 = require("../context/beanStub");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var scrollVisibleService_1 = require("../gridPanel/scrollVisibleService");
var PaginationAutoPageSizeService = /** @class */ (function (_super) {
    __extends(PaginationAutoPageSizeService, _super);
    function PaginationAutoPageSizeService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PaginationAutoPageSizeService.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_BODY_HEIGHT_CHANGED, this.onBodyHeightChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.checkPageSize();
    };
    PaginationAutoPageSizeService.prototype.notActive = function () {
        return !this.gridOptionsWrapper.isPaginationAutoPageSize();
    };
    PaginationAutoPageSizeService.prototype.onScrollVisibilityChanged = function () {
        this.checkPageSize();
    };
    PaginationAutoPageSizeService.prototype.onBodyHeightChanged = function () {
        this.checkPageSize();
    };
    PaginationAutoPageSizeService.prototype.checkPageSize = function () {
        if (this.notActive()) {
            return;
        }
        var rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        var bodyHeight = this.gridPanel.getBodyHeight();
        if (bodyHeight > 0) {
            var newPageSize = Math.floor(bodyHeight / rowHeight);
            this.gridOptionsWrapper.setProperty('paginationPageSize', newPageSize);
        }
    };
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], PaginationAutoPageSizeService.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], PaginationAutoPageSizeService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('scrollVisibleService'),
        __metadata("design:type", scrollVisibleService_1.ScrollVisibleService)
    ], PaginationAutoPageSizeService.prototype, "scrollVisibleService", void 0);
    PaginationAutoPageSizeService = __decorate([
        context_1.Bean('paginationAutoPageSizeService')
    ], PaginationAutoPageSizeService);
    return PaginationAutoPageSizeService;
}(beanStub_1.BeanStub));
exports.PaginationAutoPageSizeService = PaginationAutoPageSizeService;
