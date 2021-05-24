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
var beanStub_1 = require("../context/beanStub");
var events_1 = require("../events");
var context_1 = require("../context/context");
var PaginationAutoPageSizeService = /** @class */ (function (_super) {
    __extends(PaginationAutoPageSizeService, _super);
    function PaginationAutoPageSizeService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PaginationAutoPageSizeService.prototype.postConstruct = function () {
        var _this = this;
        this.controllersService.whenReady(function (p) {
            _this.centerRowContainerCon = p.centerRowContainerCon;
            _this.addManagedListener(_this.eventService, events_1.Events.EVENT_BODY_HEIGHT_CHANGED, _this.onBodyHeightChanged.bind(_this));
            _this.addManagedListener(_this.eventService, events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, _this.onScrollVisibilityChanged.bind(_this));
            _this.checkPageSize();
        });
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
        var bodyHeight = this.centerRowContainerCon.getViewportSizeFeature().getBodyHeight();
        if (bodyHeight > 0) {
            var newPageSize = Math.floor(bodyHeight / rowHeight);
            this.gridOptionsWrapper.setProperty('paginationPageSize', newPageSize);
        }
    };
    __decorate([
        context_1.Autowired('controllersService')
    ], PaginationAutoPageSizeService.prototype, "controllersService", void 0);
    __decorate([
        context_1.PostConstruct
    ], PaginationAutoPageSizeService.prototype, "postConstruct", null);
    PaginationAutoPageSizeService = __decorate([
        context_1.Bean('paginationAutoPageSizeService')
    ], PaginationAutoPageSizeService);
    return PaginationAutoPageSizeService;
}(beanStub_1.BeanStub));
exports.PaginationAutoPageSizeService = PaginationAutoPageSizeService;

//# sourceMappingURL=paginationAutoPageSizeService.js.map
