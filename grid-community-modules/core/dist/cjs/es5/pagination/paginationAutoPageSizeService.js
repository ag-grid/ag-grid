/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.PaginationAutoPageSizeService = void 0;
var beanStub_1 = require("../context/beanStub");
var events_1 = require("../events");
var context_1 = require("../context/context");
var function_1 = require("../utils/function");
var PaginationAutoPageSizeService = /** @class */ (function (_super) {
    __extends(PaginationAutoPageSizeService, _super);
    function PaginationAutoPageSizeService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PaginationAutoPageSizeService.prototype.postConstruct = function () {
        var _this = this;
        this.ctrlsService.whenReady(function (p) {
            _this.centerRowContainerCon = p.centerRowContainerCtrl;
            _this.addManagedListener(_this.eventService, events_1.Events.EVENT_BODY_HEIGHT_CHANGED, _this.checkPageSize.bind(_this));
            _this.addManagedListener(_this.eventService, events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, _this.checkPageSize.bind(_this));
            _this.checkPageSize();
        });
    };
    PaginationAutoPageSizeService.prototype.notActive = function () {
        return !this.gridOptionsService.is('paginationAutoPageSize') || this.centerRowContainerCon == null;
    };
    PaginationAutoPageSizeService.prototype.checkPageSize = function () {
        var _this = this;
        if (this.notActive()) {
            return;
        }
        var bodyHeight = this.centerRowContainerCon.getViewportSizeFeature().getBodyHeight();
        if (bodyHeight > 0) {
            var update_1 = function () {
                var rowHeight = _this.gridOptionsService.getRowHeightAsNumber();
                var newPageSize = Math.floor(bodyHeight / rowHeight);
                _this.gridOptionsService.set('paginationPageSize', newPageSize);
            };
            if (!this.isBodyRendered) {
                update_1();
                this.isBodyRendered = true;
            }
            else {
                function_1.debounce(function () { return update_1(); }, 50)();
            }
        }
        else {
            this.isBodyRendered = false;
        }
    };
    __decorate([
        context_1.Autowired('ctrlsService')
    ], PaginationAutoPageSizeService.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.PostConstruct
    ], PaginationAutoPageSizeService.prototype, "postConstruct", null);
    PaginationAutoPageSizeService = __decorate([
        context_1.Bean('paginationAutoPageSizeService')
    ], PaginationAutoPageSizeService);
    return PaginationAutoPageSizeService;
}(beanStub_1.BeanStub));
exports.PaginationAutoPageSizeService = PaginationAutoPageSizeService;
