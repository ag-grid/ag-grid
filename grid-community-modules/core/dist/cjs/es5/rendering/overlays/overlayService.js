"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
exports.OverlayService = void 0;
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var eventKeys_1 = require("../../eventKeys");
var OverlayService = /** @class */ (function (_super) {
    __extends(OverlayService, _super);
    function OverlayService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.manuallyDisplayed = false;
        return _this;
    }
    OverlayService.prototype.postConstruct = function () {
        var _this = this;
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_DATA_UPDATED, function () { return _this.onRowDataUpdated(); });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, function () { return _this.onNewColumnsLoaded(); });
    };
    OverlayService.prototype.registerOverlayWrapperComp = function (overlayWrapperComp) {
        this.overlayWrapperComp = overlayWrapperComp;
        if (!this.gridOptionsService.get('columnDefs') ||
            (this.gridOptionsService.isRowModelType('clientSide') && !this.gridOptionsService.get('rowData'))) {
            this.showLoadingOverlay();
        }
    };
    OverlayService.prototype.showLoadingOverlay = function () {
        if (this.gridOptionsService.get('suppressLoadingOverlay')) {
            return;
        }
        var params = {};
        var compDetails = this.userComponentFactory.getLoadingOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-loading-wrapper');
    };
    OverlayService.prototype.showNoRowsOverlay = function () {
        if (this.gridOptionsService.get('suppressNoRowsOverlay')) {
            return;
        }
        var params = {};
        var compDetails = this.userComponentFactory.getNoRowsOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-no-rows-wrapper');
    };
    OverlayService.prototype.showOverlay = function (compDetails, wrapperCssClass) {
        var promise = compDetails.newAgStackInstance();
        this.manuallyDisplayed = this.columnModel.isReady() && !this.paginationProxy.isEmpty();
        this.overlayWrapperComp.showOverlay(promise, wrapperCssClass);
    };
    OverlayService.prototype.hideOverlay = function () {
        this.manuallyDisplayed = false;
        this.overlayWrapperComp.hideOverlay();
    };
    OverlayService.prototype.showOrHideOverlay = function () {
        var isEmpty = this.paginationProxy.isEmpty();
        var isSuppressNoRowsOverlay = this.gridOptionsService.get('suppressNoRowsOverlay');
        if (isEmpty && !isSuppressNoRowsOverlay) {
            this.showNoRowsOverlay();
        }
        else {
            this.hideOverlay();
        }
    };
    OverlayService.prototype.onRowDataUpdated = function () {
        this.showOrHideOverlay();
    };
    OverlayService.prototype.onNewColumnsLoaded = function () {
        // hide overlay if columns and rows exist, this can happen if columns are loaded after data.
        // this problem exists before of the race condition between the services (column controller in this case)
        // and the view (grid panel). if the model beans were all initialised first, and then the view beans second,
        // this race condition would not happen.
        if (this.columnModel.isReady() && !this.paginationProxy.isEmpty() && !this.manuallyDisplayed) {
            this.hideOverlay();
        }
    };
    __decorate([
        (0, context_1.Autowired)('userComponentFactory')
    ], OverlayService.prototype, "userComponentFactory", void 0);
    __decorate([
        (0, context_1.Autowired)('paginationProxy')
    ], OverlayService.prototype, "paginationProxy", void 0);
    __decorate([
        (0, context_1.Autowired)('columnModel')
    ], OverlayService.prototype, "columnModel", void 0);
    __decorate([
        context_1.PostConstruct
    ], OverlayService.prototype, "postConstruct", null);
    OverlayService = __decorate([
        (0, context_1.Bean)('overlayService')
    ], OverlayService);
    return OverlayService;
}(beanStub_1.BeanStub));
exports.OverlayService = OverlayService;
