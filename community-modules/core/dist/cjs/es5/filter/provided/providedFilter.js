/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
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
var dom_1 = require("../../utils/dom");
var function_1 = require("../../utils/function");
var filterLocaleText_1 = require("../filterLocaleText");
var managedFocusFeature_1 = require("../../widgets/managedFocusFeature");
var set_1 = require("../../utils/set");
var component_1 = require("../../widgets/component");
/**
 * Contains common logic to all provided filters (apply button, clear button, etc).
 * All the filters that come with AG Grid extend this class. User filters do not
 * extend this class.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
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
    ProvidedFilter.prototype.postConstruct = function () {
        this.resetTemplate(); // do this first to create the DOM
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(this.getFocusableElement(), {
            handleKeyDown: this.handleKeyDown.bind(this)
        }));
    };
    // override
    ProvidedFilter.prototype.handleKeyDown = function (e) { };
    ProvidedFilter.prototype.getFilterTitle = function () {
        return this.translate(this.filterNameKey);
    };
    ProvidedFilter.prototype.isFilterActive = function () {
        // filter is active if we have a valid applied model
        return !!this.appliedModel;
    };
    ProvidedFilter.prototype.resetTemplate = function (paramsMap) {
        var templateString = /* html */ "\n            <div class=\"ag-filter-wrapper\">\n                <div class=\"ag-filter-body-wrapper ag-" + this.getCssIdentifier() + "-body-wrapper\">\n                    " + this.createBodyTemplate() + "\n                </div>\n            </div>";
        this.setTemplate(templateString, paramsMap);
    };
    ProvidedFilter.prototype.isReadOnly = function () {
        return !!this.providedFilterParams.readOnly;
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
        this.providedFilterParams = params;
        this.applyActive = ProvidedFilter.isUseApplyButton(params);
        this.createButtonPanel();
    };
    ProvidedFilter.prototype.createButtonPanel = function () {
        var _this = this;
        var buttons = this.providedFilterParams.buttons;
        if (!buttons || buttons.length < 1 || this.isReadOnly()) {
            return;
        }
        var eButtonsPanel = document.createElement('div');
        eButtonsPanel.classList.add('ag-filter-apply-panel');
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
                    console.warn('AG Grid: Unknown button type specified');
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
    // subclasses can override this to provide alternative debounce defaults
    ProvidedFilter.prototype.getDefaultDebounceMs = function () {
        return 0;
    };
    ProvidedFilter.prototype.setupOnBtApplyDebounce = function () {
        var debounceMs = ProvidedFilter.getDebounceMs(this.providedFilterParams, this.getDefaultDebounceMs());
        this.onBtApplyDebounce = function_1.debounce(this.onBtApply.bind(this), debounceMs);
    };
    ProvidedFilter.prototype.getModel = function () {
        return this.appliedModel ? this.appliedModel : null;
    };
    ProvidedFilter.prototype.setModel = function (model) {
        var _this = this;
        var promise = model != null ? this.setModelIntoUi(model) : this.resetUiToDefaults();
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
    /**
     * By default, if the change came from a floating filter it will be applied immediately, otherwise if there is no
     * apply button it will be applied after a debounce, otherwise it will not be applied at all. This behaviour can
     * be adjusted by using the apply parameter.
     */
    ProvidedFilter.prototype.onUiChanged = function (fromFloatingFilter, apply) {
        if (fromFloatingFilter === void 0) { fromFloatingFilter = false; }
        this.updateUiVisibility();
        this.providedFilterParams.filterModifiedCallback();
        if (this.applyActive && !this.isReadOnly) {
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
    ProvidedFilter.prototype.getCellValue = function (rowNode) {
        var _a = this.providedFilterParams, api = _a.api, colDef = _a.colDef, column = _a.column, columnApi = _a.columnApi, context = _a.context;
        return this.providedFilterParams.valueGetter({
            api: api,
            colDef: colDef,
            column: column,
            columnApi: columnApi,
            context: context,
            data: rowNode.data,
            getValue: function (field) { return rowNode.data[field]; },
            node: rowNode,
        });
    };
    __decorate([
        context_1.Autowired('rowModel')
    ], ProvidedFilter.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('valueService')
    ], ProvidedFilter.prototype, "valueService", void 0);
    __decorate([
        context_1.PostConstruct
    ], ProvidedFilter.prototype, "postConstruct", null);
    return ProvidedFilter;
}(component_1.Component));
exports.ProvidedFilter = ProvidedFilter;
