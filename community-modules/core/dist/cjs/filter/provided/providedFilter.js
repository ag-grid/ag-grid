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
var context_1 = require("../../context/context");
var constants_1 = require("../../constants/constants");
var dom_1 = require("../../utils/dom");
var function_1 = require("../../utils/function");
var filterLocaleText_1 = require("../filterLocaleText");
var managedFocusComponent_1 = require("../../widgets/managedFocusComponent");
var set_1 = require("../../utils/set");
/**
 * Contains common logic to all provided filters (apply button, clear button, etc).
 * All the filters that come with AG Grid extend this class. User filters do not
 * extend this class.
 */
var ProvidedFilter = /** @class */ (function (_super) {
    __extends(ProvidedFilter, _super);
    function ProvidedFilter(filterNameKey) {
        var _this = _super.call(this) || this;
        _this.filterNameKey = filterNameKey;
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
    ProvidedFilter.prototype.getFilterTitle = function () {
        return this.translate(this.filterNameKey);
    };
    /** @deprecated */
    ProvidedFilter.prototype.onFilterChanged = function () {
        console.warn("AG Grid: you should not call onFilterChanged() directly on the filter, please call\n        gridApi.onFilterChanged() instead. onFilterChanged is not part of the exposed filter interface (it was\n        a method that existed on an old version of the filters that was not intended for public use.");
        this.providedFilterParams.filterChangedCallback();
    };
    ProvidedFilter.prototype.isFilterActive = function () {
        // filter is active if we have a valid applied model
        return !!this.appliedModel;
    };
    ProvidedFilter.prototype.postConstruct = function () {
        this.resetTemplate(); // do this first to create the DOM
        _super.prototype.postConstruct.call(this);
    };
    ProvidedFilter.prototype.resetTemplate = function (paramsMap) {
        var templateString = /* html */ "\n            <div class=\"ag-filter-wrapper\">\n                <div class=\"ag-filter-body-wrapper ag-" + this.getCssIdentifier() + "-body-wrapper\">\n                    " + this.createBodyTemplate() + "\n                </div>\n            </div>";
        this.setTemplate(templateString, paramsMap);
    };
    ProvidedFilter.prototype.init = function (params) {
        var _this = this;
        this.setParams(params);
        this.resetUiToDefaults(true).then(function () {
            _this.updateUiVisibility();
            _this.setupOnBtApplyDebounce();
        });
    };
    ProvidedFilter.prototype.setParams = function (params) {
        ProvidedFilter.checkForDeprecatedParams(params);
        this.providedFilterParams = params;
        if (params.newRowsAction === 'keep') {
            this.newRowsActionKeep = true;
        }
        else if (params.newRowsAction === 'clear') {
            this.newRowsActionKeep = false;
        }
        else {
            // the default for SSRM and IRM is 'keep', for CSRM and VRM the default is 'clear'
            var modelsForKeep = [constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE, constants_1.Constants.ROW_MODEL_TYPE_INFINITE];
            this.newRowsActionKeep = modelsForKeep.indexOf(this.rowModel.getType()) >= 0;
        }
        this.applyActive = ProvidedFilter.isUseApplyButton(params);
        this.createButtonPanel();
    };
    ProvidedFilter.prototype.createButtonPanel = function () {
        var _this = this;
        var buttons = this.providedFilterParams.buttons;
        if (!buttons || buttons.length < 1) {
            return;
        }
        var eButtonsPanel = document.createElement('div');
        dom_1.addCssClass(eButtonsPanel, 'ag-filter-apply-panel');
        var addButton = function (type) {
            var text;
            var clickListener;
            switch (type) {
                case 'apply':
                    text = _this.translate('applyFilter');
                    clickListener = function (e) { return _this.onBtApply(false, false, e); };
                    break;
                case 'clear':
                    text = _this.translate('clearFilter');
                    clickListener = function () { return _this.onBtClear(); };
                    break;
                case 'reset':
                    text = _this.translate('resetFilter');
                    clickListener = function () { return _this.onBtReset(); };
                    break;
                case 'cancel':
                    text = _this.translate('cancelFilter');
                    clickListener = function (e) { _this.onBtCancel(e); };
                    break;
                default:
                    console.warn('Unknown button type specified');
                    return;
            }
            var button = dom_1.loadTemplate(
            /* html */
            "<button\n                    type=\"button\"\n                    ref=\"" + type + "FilterButton\"\n                    class=\"ag-standard-button ag-filter-apply-panel-button\"\n                >" + text + "\n                </button>");
            eButtonsPanel.appendChild(button);
            _this.addManagedListener(button, 'click', clickListener);
        };
        set_1.convertToSet(buttons).forEach(function (type) { return addButton(type); });
        this.getGui().appendChild(eButtonsPanel);
    };
    ProvidedFilter.checkForDeprecatedParams = function (params) {
        var buttons = params.buttons || [];
        if (buttons.length > 0) {
            return;
        }
        var applyButton = params.applyButton, resetButton = params.resetButton, clearButton = params.clearButton;
        if (clearButton) {
            console.warn('AG Grid: as of AG Grid v23.2, filterParams.clearButton is deprecated. Please use filterParams.buttons instead');
            buttons.push('clear');
        }
        if (resetButton) {
            console.warn('AG Grid: as of AG Grid v23.2, filterParams.resetButton is deprecated. Please use filterParams.buttons instead');
            buttons.push('reset');
        }
        if (applyButton) {
            console.warn('AG Grid: as of AG Grid v23.2, filterParams.applyButton is deprecated. Please use filterParams.buttons instead');
            buttons.push('apply');
        }
        if (params.apply) {
            console.warn('AG Grid: as of AG Grid v21, filterParams.apply is deprecated. Please use filterParams.buttons instead');
            buttons.push('apply');
        }
        params.buttons = buttons;
    };
    // subclasses can override this to provide alternative debounce defaults
    ProvidedFilter.prototype.getDefaultDebounceMs = function () {
        return 0;
    };
    ProvidedFilter.prototype.setupOnBtApplyDebounce = function () {
        var debounceMs = ProvidedFilter.getDebounceMs(this.providedFilterParams, this.getDefaultDebounceMs());
        this.onBtApplyDebounce = function_1.debounce(this.onBtApply.bind(this), debounceMs);
    };
    ProvidedFilter.prototype.getModel = function () {
        return this.appliedModel;
    };
    ProvidedFilter.prototype.setModel = function (model) {
        var _this = this;
        var promise = model ? this.setModelIntoUi(model) : this.resetUiToDefaults();
        return promise.then(function () {
            _this.updateUiVisibility();
            // we set the model from the GUI, rather than the provided model,
            // so the model is consistent, e.g. handling of null/undefined will be the same,
            // or if model is case insensitive, then casing is removed.
            _this.applyModel();
        });
    };
    ProvidedFilter.prototype.onBtCancel = function (e) {
        var _this = this;
        var currentModel = this.getModel();
        var afterAppliedFunc = function () {
            _this.onUiChanged(false, 'prevent');
            if (_this.providedFilterParams.closeOnApply) {
                _this.close(e);
            }
        };
        if (currentModel != null) {
            this.setModelIntoUi(currentModel).then(afterAppliedFunc);
        }
        else {
            this.resetUiToDefaults().then(afterAppliedFunc);
        }
    };
    ProvidedFilter.prototype.onBtClear = function () {
        var _this = this;
        this.resetUiToDefaults().then(function () { return _this.onUiChanged(); });
    };
    ProvidedFilter.prototype.onBtReset = function () {
        this.onBtClear();
        this.onBtApply();
    };
    /**
     * Applies changes made in the UI to the filter, and returns true if the model has changed.
     */
    ProvidedFilter.prototype.applyModel = function () {
        var newModel = this.getModelFromUi();
        if (!this.isModelValid(newModel)) {
            return false;
        }
        var previousModel = this.appliedModel;
        this.appliedModel = newModel;
        // models can be same if user pasted same content into text field, or maybe just changed the case
        // and it's a case insensitive filter
        return !this.areModelsEqual(previousModel, newModel);
    };
    ProvidedFilter.prototype.isModelValid = function (model) {
        return true;
    };
    ProvidedFilter.prototype.onBtApply = function (afterFloatingFilter, afterDataChange, e) {
        if (afterFloatingFilter === void 0) { afterFloatingFilter = false; }
        if (afterDataChange === void 0) { afterDataChange = false; }
        if (this.applyModel()) {
            // the floating filter uses 'afterFloatingFilter' info, so it doesn't refresh after filter changed if change
            // came from floating filter
            this.providedFilterParams.filterChangedCallback({ afterFloatingFilter: afterFloatingFilter, afterDataChange: afterDataChange });
        }
        var closeOnApply = this.providedFilterParams.closeOnApply;
        // only close if an apply button is visible, otherwise we'd be closing every time a change was made!
        if (closeOnApply && this.applyActive && !afterFloatingFilter && !afterDataChange) {
            this.close(e);
        }
    };
    ProvidedFilter.prototype.onNewRowsLoaded = function () {
        var _this = this;
        if (!this.newRowsActionKeep) {
            this.resetUiToDefaults().then(function () { return _this.appliedModel = null; });
        }
    };
    ProvidedFilter.prototype.close = function (e) {
        if (!this.hidePopup) {
            return;
        }
        var keyboardEvent = e;
        var key = keyboardEvent && keyboardEvent.key;
        var params;
        if (key === 'Enter' || key === 'Space') {
            params = { keyboardEvent: keyboardEvent };
        }
        this.hidePopup(params);
        this.hidePopup = null;
    };
    // called by set filter
    ProvidedFilter.prototype.isNewRowsActionKeep = function () {
        return this.newRowsActionKeep;
    };
    /**
     * By default, if the change came from a floating filter it will be applied immediately, otherwise if there is no
     * apply button it will be applied after a debounce, otherwise it will not be applied at all. This behaviour can
     * be adjusted by using the apply parameter.
     */
    ProvidedFilter.prototype.onUiChanged = function (fromFloatingFilter, apply) {
        if (fromFloatingFilter === void 0) { fromFloatingFilter = false; }
        this.updateUiVisibility();
        this.providedFilterParams.filterModifiedCallback();
        if (this.applyActive) {
            var isValid = this.isModelValid(this.getModelFromUi());
            dom_1.setDisabled(this.getRefElement('applyFilterButton'), !isValid);
        }
        if ((fromFloatingFilter && !apply) || apply === 'immediately') {
            this.onBtApply(fromFloatingFilter);
        }
        else if ((!this.applyActive && !apply) || apply === 'debounce') {
            this.onBtApplyDebounce();
        }
    };
    ProvidedFilter.prototype.afterGuiAttached = function (params) {
        if (params == null) {
            return;
        }
        this.hidePopup = params.hidePopup;
    };
    // static, as used by floating filter also
    ProvidedFilter.getDebounceMs = function (params, debounceDefault) {
        if (ProvidedFilter.isUseApplyButton(params)) {
            if (params.debounceMs != null) {
                console.warn('AG Grid: debounceMs is ignored when apply button is present');
            }
            return 0;
        }
        return params.debounceMs != null ? params.debounceMs : debounceDefault;
    };
    // static, as used by floating filter also
    ProvidedFilter.isUseApplyButton = function (params) {
        ProvidedFilter.checkForDeprecatedParams(params);
        return !!params.buttons && params.buttons.indexOf('apply') >= 0;
    };
    ProvidedFilter.prototype.destroy = function () {
        this.hidePopup = null;
        _super.prototype.destroy.call(this);
    };
    ProvidedFilter.prototype.translate = function (key) {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(key, filterLocaleText_1.DEFAULT_FILTER_LOCALE_TEXT[key]);
    };
    __decorate([
        context_1.Autowired('rowModel')
    ], ProvidedFilter.prototype, "rowModel", void 0);
    __decorate([
        context_1.PostConstruct
    ], ProvidedFilter.prototype, "postConstruct", null);
    return ProvidedFilter;
}(managedFocusComponent_1.ManagedFocusComponent));
exports.ProvidedFilter = ProvidedFilter;

//# sourceMappingURL=providedFilter.js.map
