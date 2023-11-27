"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayService = void 0;
const beanStub_1 = require("../../context/beanStub");
const context_1 = require("../../context/context");
const eventKeys_1 = require("../../eventKeys");
let OverlayService = class OverlayService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.manuallyDisplayed = false;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_DATA_UPDATED, () => this.onRowDataUpdated());
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, () => this.onNewColumnsLoaded());
    }
    registerOverlayWrapperComp(overlayWrapperComp) {
        this.overlayWrapperComp = overlayWrapperComp;
        if (!this.gridOptionsService.get('columnDefs') ||
            (this.gridOptionsService.isRowModelType('clientSide') && !this.gridOptionsService.get('rowData'))) {
            this.showLoadingOverlay();
        }
    }
    showLoadingOverlay() {
        if (this.gridOptionsService.get('suppressLoadingOverlay')) {
            return;
        }
        const params = {};
        const compDetails = this.userComponentFactory.getLoadingOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-loading-wrapper');
    }
    showNoRowsOverlay() {
        if (this.gridOptionsService.get('suppressNoRowsOverlay')) {
            return;
        }
        const params = {};
        const compDetails = this.userComponentFactory.getNoRowsOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-no-rows-wrapper');
    }
    showOverlay(compDetails, wrapperCssClass) {
        const promise = compDetails.newAgStackInstance();
        this.manuallyDisplayed = this.columnModel.isReady() && !this.paginationProxy.isEmpty();
        this.overlayWrapperComp.showOverlay(promise, wrapperCssClass);
    }
    hideOverlay() {
        this.manuallyDisplayed = false;
        this.overlayWrapperComp.hideOverlay();
    }
    showOrHideOverlay() {
        const isEmpty = this.paginationProxy.isEmpty();
        const isSuppressNoRowsOverlay = this.gridOptionsService.get('suppressNoRowsOverlay');
        if (isEmpty && !isSuppressNoRowsOverlay) {
            this.showNoRowsOverlay();
        }
        else {
            this.hideOverlay();
        }
    }
    onRowDataUpdated() {
        this.showOrHideOverlay();
    }
    onNewColumnsLoaded() {
        // hide overlay if columns and rows exist, this can happen if columns are loaded after data.
        // this problem exists before of the race condition between the services (column controller in this case)
        // and the view (grid panel). if the model beans were all initialised first, and then the view beans second,
        // this race condition would not happen.
        if (this.columnModel.isReady() && !this.paginationProxy.isEmpty() && !this.manuallyDisplayed) {
            this.hideOverlay();
        }
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
exports.OverlayService = OverlayService;
