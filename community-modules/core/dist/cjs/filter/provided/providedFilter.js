/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.1.0
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
var component_1 = require("../../widgets/component");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var context_1 = require("../../context/context");
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
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.applyActive = false;
        _this.hidePopup = null;
        // after the user hits 'apply' the model gets copied to here. this is then the model that we use for
        // all filtering. so if user changes UI but doesn't hit apply, then the UI will be out of sync with this model.
        // this is what we want, as the UI should only become the 'active' filter once it's applied. when apply is
        // inactive, this model will be in sync (following the debounce ms). if the UI is not a valid filter
        // (eg the value is missing so nothing to filter on, or for set filter all checkboxes are checked so filter
        // not active) then this appliedModel will be null/undefined.
        _this.appliedModel = null;
        return _this;
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
        var templateString = /* html */ "\n            <div>\n                <div class=\"ag-filter-body-wrapper ag-" + this.getCssIdentifier() + "-body-wrapper\" ref=\"eFilterBodyWrapper\">\n                    " + this.createBodyTemplate() + "\n                </div>\n            </div>";
        this.setTemplate(templateString);
    };
    ProvidedFilter.prototype.init = function (params) {
        this.setParams(params);
        this.resetUiToDefaults(true);
        this.updateUiVisibility();
        this.setupOnBtApplyDebounce();
    };
    ProvidedFilter.prototype.setParams = function (params) {
        this.providedFilterParams = params;
        if (params.newRowsAction === ProvidedFilter.NEW_ROWS_ACTION_KEEP) {
            this.newRowsActionKeep = true;
        }
        else if (params.newRowsAction === ProvidedFilter.NEW_ROWS_ACTION_CLEAR) {
            this.newRowsActionKeep = false;
        }
        else {
            // the default for SSRM and IRM is 'keep', for CSRM and VRM the default is 'clear'
            var rowModelType = this.rowModel.getType();
            var modelsForKeep = [constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE, constants_1.Constants.ROW_MODEL_TYPE_INFINITE];
            this.newRowsActionKeep = modelsForKeep.indexOf(rowModelType) >= 0;
        }
        this.applyActive = ProvidedFilter.isUseApplyButton(params);
        this.createButtonPanel(params);
    };
    ProvidedFilter.prototype.createButtonPanel = function (params) {
        var _this = this;
        var clearActive = params.clearButton === true;
        var resetActive = params.resetButton === true;
        var anyButtonVisible = this.applyActive || clearActive || resetActive;
        if (anyButtonVisible) {
            var translate = this.gridOptionsWrapper.getLocaleTextFunc();
            var eButtonsPanel_1 = document.createElement('div');
            utils_1._.addCssClass(eButtonsPanel_1, 'ag-filter-apply-panel');
            var addButton = function (text, clickListener) {
                var button = utils_1._.loadTemplate(/* html */ "<button type=\"button\" class=\"ag-standard-button ag-filter-apply-panel-button\">" + text + "</button>");
                eButtonsPanel_1.appendChild(button);
                _this.addDestroyableEventListener(button, 'click', clickListener);
            };
            if (clearActive) {
                addButton(translate('clearFilter', 'Clear Filter'), function () { return _this.onBtClear(); });
            }
            if (resetActive) {
                addButton(translate('resetFilter', 'Reset Filter'), function () { return _this.onBtReset(); });
            }
            if (this.applyActive) {
                addButton(translate('applyFilter', 'Apply Filter'), function () { return _this.onBtApply(); });
            }
            this.eFilterBodyWrapper.parentElement.appendChild(eButtonsPanel_1);
        }
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
    ProvidedFilter.prototype.onBtReset = function () {
        this.onBtClear();
        this.onBtApply();
    };
    // returns true if the new model is different to the old model
    ProvidedFilter.prototype.applyModel = function () {
        var oldAppliedModel = this.appliedModel;
        this.appliedModel = this.getModelFromUi();
        // models can be same if user pasted same content into text field, or maybe just changed the case
        // and it's a case insensitive filter
        return !this.areModelsEqual(this.appliedModel, oldAppliedModel);
    };
    ProvidedFilter.prototype.onBtApply = function (afterFloatingFilter, afterDataChange) {
        if (afterFloatingFilter === void 0) { afterFloatingFilter = false; }
        if (afterDataChange === void 0) { afterDataChange = false; }
        if (this.applyModel()) {
            // the floating filter uses 'afterFloatingFilter' info, so it doesn't refresh after filter changed if change
            // came from floating filter
            this.providedFilterParams.filterChangedCallback({ afterFloatingFilter: afterFloatingFilter, afterDataChange: afterDataChange });
        }
        var _a = this.providedFilterParams, closeOnApply = _a.closeOnApply, applyButton = _a.applyButton, resetButton = _a.resetButton;
        if (closeOnApply && !afterFloatingFilter && this.hidePopup && (applyButton || resetButton)) {
            this.hidePopup();
            this.hidePopup = null;
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
        if (afterFloatingFilter) {
            // floating filter changes are always applied immediately
            this.onBtApply(true);
        }
        else if (!this.applyActive) {
            // if no apply button, we apply (but debounce for time delay)
            this.onBtApplyDebounce();
        }
    };
    ProvidedFilter.prototype.afterGuiAttached = function (params) {
        this.hidePopup = params.hidePopup;
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
    ProvidedFilter.prototype.destroy = function () {
        this.hidePopup = null;
        _super.prototype.destroy.call(this);
    };
    ProvidedFilter.NEW_ROWS_ACTION_KEEP = 'keep';
    ProvidedFilter.NEW_ROWS_ACTION_CLEAR = 'clear';
    __decorate([
        componentAnnotations_1.RefSelector('eFilterBodyWrapper')
    ], ProvidedFilter.prototype, "eFilterBodyWrapper", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], ProvidedFilter.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('rowModel')
    ], ProvidedFilter.prototype, "rowModel", void 0);
    __decorate([
        context_1.PostConstruct
    ], ProvidedFilter.prototype, "postConstruct", null);
    return ProvidedFilter;
}(component_1.Component));
exports.ProvidedFilter = ProvidedFilter;

//# sourceMappingURL=providedFilter.js.map
