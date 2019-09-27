/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var component_1 = require("../../widgets/component");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var utils_1 = require("../../utils");
var constants_1 = require("../../constants");
/**
 * Contains common logic to all provided filters (apply button, clear button, etc).
 * All the filters that come with ag-Grid extend this class. User filters do not
 * extend this class.
 */
var ProvidedFilter = /** @class */ (function (_super) {
    __extends(ProvidedFilter, _super);
    function ProvidedFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** @deprecated */
    ProvidedFilter.prototype.onFilterChanged = function () {
        console.warn("ag-Grid: you should not call onFilterChanged() directly on the filter, please call\n        gridApi.onFilterChanged() instead. onFilterChanged is not part of the exposed filter interface (it was\n        a method that existed on an old version of the filters that was not intended for public use.");
        this.providedFilterParams.filterChangedCallback();
    };
    ProvidedFilter.prototype.isFilterActive = function () {
        // filter is active if we have a valid applied model
        return !!this.appliedModel;
    };
    ProvidedFilter.prototype.postConstruct = function () {
        var templateString = this.createTemplate();
        this.setTemplate(templateString);
    };
    ProvidedFilter.prototype.init = function (params) {
        this.setParams(params);
        this.resetUiToDefaults();
        this.updateUiVisibility();
        this.setupOnBtApplyDebounce();
    };
    ProvidedFilter.prototype.setParams = function (params) {
        var _this = this;
        this.providedFilterParams = params;
        this.clearActive = params.clearButton === true;
        this.applyActive = ProvidedFilter.isUseApplyButton(params);
        if (params.newRowsAction === ProvidedFilter.NEW_ROWS_ACTION_KEEP) {
            this.newRowsActionKeep = true;
        }
        else if (params.newRowsAction === ProvidedFilter.NEW_ROWS_ACTION_CLEAR) {
            this.newRowsActionKeep = false;
        }
        else {
            // the default for SSRM and IRM is 'keep', for CSRM and VRM teh default is 'clear'
            var rowModelType = this.rowModel.getType();
            var modelsForKeep = [constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE, constants_1.Constants.ROW_MODEL_TYPE_INFINITE];
            this.newRowsActionKeep = modelsForKeep.indexOf(rowModelType) >= 0;
        }
        utils_1._.setDisplayed(this.eApplyButton, this.applyActive);
        // we do not bind onBtApply here because onBtApply() has a parameter, and it is not the event. if we
        // just applied, the event would get passed as the second parameter, which we do not want.
        this.addDestroyableEventListener(this.eApplyButton, "click", function () { return _this.onBtApply(); });
        utils_1._.setDisplayed(this.eClearButton, this.clearActive);
        this.addDestroyableEventListener(this.eClearButton, "click", this.onBtClear.bind(this));
        var anyButtonVisible = this.applyActive || this.clearActive;
        utils_1._.setDisplayed(this.eButtonsPanel, anyButtonVisible);
    };
    // subclasses can override this to provide alternative debounce defaults
    ProvidedFilter.prototype.getDefaultDebounceMs = function () {
        return 0;
    };
    ProvidedFilter.prototype.setupOnBtApplyDebounce = function () {
        var debounceMs = ProvidedFilter.getDebounceMs(this.providedFilterParams, this.getDefaultDebounceMs());
        this.onBtApplyDebounce = utils_1._.debounce(this.onBtApply.bind(this), debounceMs);
    };
    ProvidedFilter.prototype.getModel = function () {
        return this.appliedModel;
    };
    ProvidedFilter.prototype.setModel = function (model) {
        if (model) {
            this.setModelIntoUi(model);
        }
        else {
            this.resetUiToDefaults();
        }
        this.updateUiVisibility();
        // we set the model from the gui, rather than the provided model,
        // so the model is consistent. eg handling of null/undefined will be the same,
        // of if model is case insensitive, then casing is removed.
        this.applyModel();
    };
    ProvidedFilter.prototype.onBtClear = function () {
        this.resetUiToDefaults();
        this.updateUiVisibility();
        this.onUiChanged();
    };
    // returns true if the new model is different to the old model
    ProvidedFilter.prototype.applyModel = function () {
        var oldAppliedModel = this.appliedModel;
        this.appliedModel = this.getModelFromUi();
        // models can be same if user pasted same content into text field, or maybe just changed the case
        // and it's a case insensitive filter
        var newModelDifferent = !this.areModelsEqual(this.appliedModel, oldAppliedModel);
        return newModelDifferent;
    };
    ProvidedFilter.prototype.onBtApply = function (afterFloatingFilter) {
        if (afterFloatingFilter === void 0) { afterFloatingFilter = false; }
        var newModelDifferent = this.applyModel();
        if (newModelDifferent) {
            // the floating filter uses 'afterFloatingFilter' info, so it doesn't refresh after filter changed if change
            // came from floating filter
            this.providedFilterParams.filterChangedCallback({ afterFloatingFilter: afterFloatingFilter });
        }
    };
    ProvidedFilter.prototype.onNewRowsLoaded = function () {
        if (!this.newRowsActionKeep) {
            this.resetUiToDefaults();
            this.appliedModel = null;
        }
    };
    // called by set filter
    ProvidedFilter.prototype.isNewRowsActionKeep = function () {
        return this.newRowsActionKeep;
    };
    ProvidedFilter.prototype.onUiChanged = function (afterFloatingFilter) {
        if (afterFloatingFilter === void 0) { afterFloatingFilter = false; }
        this.updateUiVisibility();
        this.providedFilterParams.filterModifiedCallback();
        // applyNow=true for floating filter changes, we always act on these immediately
        if (afterFloatingFilter) {
            this.onBtApply(true);
            // otherwise if no apply button, we apply (but debounce for time delay)
        }
        else if (!this.applyActive) {
            this.onBtApplyDebounce();
        }
    };
    ProvidedFilter.prototype.createTemplate = function () {
        var body = this.createBodyTemplate();
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return "<div>\n                    <div class='ag-filter-body-wrapper' ref=\"eFilterBodyWrapper\">" + body + "</div>\n                    <div class=\"ag-filter-apply-panel\" ref=\"eButtonsPanel\">\n                        <button type=\"button\" ref=\"eClearButton\">" + translate('clearFilter', 'Clear Filter') + "</button>\n                        <button type=\"button\" ref=\"eApplyButton\">" + translate('applyFilter', 'Apply Filter') + "</button>\n                    </div>\n                </div>";
    };
    // static, as used by floating filter also
    ProvidedFilter.getDebounceMs = function (params, debounceDefault) {
        var applyActive = ProvidedFilter.isUseApplyButton(params);
        if (applyActive) {
            if (params.debounceMs != null) {
                console.warn('ag-Grid: debounceMs is ignored when applyButton = true');
            }
            return 0;
        }
        return params.debounceMs != null ? params.debounceMs : debounceDefault;
    };
    // static, as used by floating filter also
    ProvidedFilter.isUseApplyButton = function (params) {
        if (params.apply && !params.applyButton) {
            console.warn('ag-Grid: as of ag-Grid v21, filterParams.apply is now filterParams.applyButton, please change to applyButton');
            params.applyButton = true;
        }
        return params.applyButton === true;
    };
    ProvidedFilter.NEW_ROWS_ACTION_KEEP = 'keep';
    ProvidedFilter.NEW_ROWS_ACTION_CLEAR = 'clear';
    __decorate([
        componentAnnotations_1.RefSelector('eButtonsPanel'),
        __metadata("design:type", HTMLElement)
    ], ProvidedFilter.prototype, "eButtonsPanel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eFilterBodyWrapper'),
        __metadata("design:type", HTMLElement)
    ], ProvidedFilter.prototype, "eFilterBodyWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eApplyButton'),
        __metadata("design:type", HTMLElement)
    ], ProvidedFilter.prototype, "eApplyButton", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eClearButton'),
        __metadata("design:type", HTMLElement)
    ], ProvidedFilter.prototype, "eClearButton", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ProvidedFilter.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], ProvidedFilter.prototype, "rowModel", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ProvidedFilter.prototype, "postConstruct", null);
    return ProvidedFilter;
}(component_1.Component));
exports.ProvidedFilter = ProvidedFilter;
