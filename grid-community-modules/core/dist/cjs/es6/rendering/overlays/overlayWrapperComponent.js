/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
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
exports.OverlayWrapperComponent = void 0;
const context_1 = require("../../context/context");
const component_1 = require("../../widgets/component");
const componentAnnotations_1 = require("../../widgets/componentAnnotations");
const dom_1 = require("../../utils/dom");
const layoutFeature_1 = require("../../styling/layoutFeature");
const eventKeys_1 = require("../../eventKeys");
var LoadingType;
(function (LoadingType) {
    LoadingType[LoadingType["Loading"] = 0] = "Loading";
    LoadingType[LoadingType["NoRows"] = 1] = "NoRows";
})(LoadingType || (LoadingType = {}));
class OverlayWrapperComponent extends component_1.Component {
    constructor() {
        super(OverlayWrapperComponent.TEMPLATE);
        this.inProgress = false;
        this.destroyRequested = false;
        this.manuallyDisplayed = false;
    }
    updateLayoutClasses(cssClass, params) {
        const overlayWrapperClassList = this.eOverlayWrapper.classList;
        overlayWrapperClassList.toggle(layoutFeature_1.LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        overlayWrapperClassList.toggle(layoutFeature_1.LayoutCssClasses.NORMAL, params.normal);
        overlayWrapperClassList.toggle(layoutFeature_1.LayoutCssClasses.PRINT, params.print);
    }
    postConstruct() {
        this.createManagedBean(new layoutFeature_1.LayoutFeature(this));
        this.setDisplayed(false, { skipAriaHidden: true });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_DATA_UPDATED, this.onRowDataUpdated.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        if (this.gridOptionsService.isRowModelType('clientSide') && !this.gridOptionsService.get('rowData')) {
            this.showLoadingOverlay();
        }
        this.gridApi.registerOverlayWrapperComp(this);
    }
    setWrapperTypeClass(loadingType) {
        const overlayWrapperClassList = this.eOverlayWrapper.classList;
        overlayWrapperClassList.toggle('ag-overlay-loading-wrapper', loadingType === LoadingType.Loading);
        overlayWrapperClassList.toggle('ag-overlay-no-rows-wrapper', loadingType === LoadingType.NoRows);
    }
    showLoadingOverlay() {
        if (this.gridOptionsService.is('suppressLoadingOverlay')) {
            return;
        }
        const params = {};
        const compDetails = this.userComponentFactory.getLoadingOverlayCompDetails(params);
        const promise = compDetails.newAgStackInstance();
        this.showOverlay(promise, LoadingType.Loading);
    }
    showNoRowsOverlay() {
        if (this.gridOptionsService.is('suppressNoRowsOverlay')) {
            return;
        }
        const params = {};
        const compDetails = this.userComponentFactory.getNoRowsOverlayCompDetails(params);
        const promise = compDetails.newAgStackInstance();
        this.showOverlay(promise, LoadingType.NoRows);
    }
    showOverlay(workItem, type) {
        if (this.inProgress) {
            return;
        }
        this.setWrapperTypeClass(type);
        this.destroyActiveOverlay();
        this.inProgress = true;
        if (workItem) {
            workItem.then(comp => {
                this.inProgress = false;
                this.eOverlayWrapper.appendChild(comp.getGui());
                this.activeOverlay = comp;
                if (this.destroyRequested) {
                    this.destroyRequested = false;
                    this.destroyActiveOverlay();
                }
            });
        }
        this.manuallyDisplayed = this.columnModel.isReady() && !this.paginationProxy.isEmpty();
        this.setDisplayed(true, { skipAriaHidden: true });
    }
    destroyActiveOverlay() {
        if (this.inProgress) {
            this.destroyRequested = true;
            return;
        }
        if (!this.activeOverlay) {
            return;
        }
        this.activeOverlay = this.getContext().destroyBean(this.activeOverlay);
        dom_1.clearElement(this.eOverlayWrapper);
    }
    hideOverlay() {
        this.manuallyDisplayed = false;
        this.destroyActiveOverlay();
        this.setDisplayed(false, { skipAriaHidden: true });
    }
    destroy() {
        this.destroyActiveOverlay();
        super.destroy();
    }
    showOrHideOverlay() {
        const isEmpty = this.paginationProxy.isEmpty();
        const isSuppressNoRowsOverlay = this.gridOptionsService.is('suppressNoRowsOverlay');
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
}
// wrapping in outer div, and wrapper, is needed to center the loading icon
OverlayWrapperComponent.TEMPLATE = `
        <div class="ag-overlay" aria-hidden="true">
            <div class="ag-overlay-panel">
                <div class="ag-overlay-wrapper" ref="eOverlayWrapper"></div>
            </div>
        </div>`;
__decorate([
    context_1.Autowired('userComponentFactory')
], OverlayWrapperComponent.prototype, "userComponentFactory", void 0);
__decorate([
    context_1.Autowired('paginationProxy')
], OverlayWrapperComponent.prototype, "paginationProxy", void 0);
__decorate([
    context_1.Autowired('gridApi')
], OverlayWrapperComponent.prototype, "gridApi", void 0);
__decorate([
    context_1.Autowired('columnModel')
], OverlayWrapperComponent.prototype, "columnModel", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eOverlayWrapper')
], OverlayWrapperComponent.prototype, "eOverlayWrapper", void 0);
__decorate([
    context_1.PostConstruct
], OverlayWrapperComponent.prototype, "postConstruct", null);
exports.OverlayWrapperComponent = OverlayWrapperComponent;
