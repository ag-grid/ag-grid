/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { Component } from '../../widgets/component';
import { Autowired, PostConstruct } from '../../context/context';
import { Constants } from '../../constants';
import { loadTemplate, addCssClass, setDisabled } from '../../utils/dom';
import { debounce } from '../../utils/function';
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
        var templateString = /* html */ "\n            <div>\n                <div class=\"ag-filter-body-wrapper ag-" + this.getCssIdentifier() + "-body-wrapper\">\n                    " + this.createBodyTemplate() + "\n                </div>\n            </div>";
        this.setTemplate(templateString);
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
            var modelsForKeep = [Constants.ROW_MODEL_TYPE_SERVER_SIDE, Constants.ROW_MODEL_TYPE_INFINITE];
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
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var eButtonsPanel = document.createElement('div');
        addCssClass(eButtonsPanel, 'ag-filter-apply-panel');
        var addButton = function (type) {
            var text;
            var clickListener;
            switch (type) {
                case 'apply':
                    text = translate('applyFilter', 'Apply Filter');
                    clickListener = function (e) { return _this.onBtApply(false, false, e); };
                    break;
                case 'clear':
                    text = translate('clearFilter', 'Clear Filter');
                    clickListener = function () { return _this.onBtClear(); };
                    break;
                case 'reset':
                    text = translate('resetFilter', 'Reset Filter');
                    clickListener = function () { return _this.onBtReset(); };
                    break;
                case 'cancel':
                    text = translate('cancelFilter', 'Cancel Filter');
                    clickListener = function (e) { _this.onBtCancel(e); };
                    break;
                default:
                    console.warn('Unknown button type specified');
                    return;
            }
            var button = loadTemplate(/* html */ "<button\n                    type=\"button\"\n                    ref=\"" + type + "FilterButton\"\n                    class=\"ag-standard-button ag-filter-apply-panel-button\">" + text + "</button>");
            eButtonsPanel.appendChild(button);
            _this.addManagedListener(button, 'click', clickListener);
        };
        new Set(buttons).forEach(function (type) { return addButton(type); });
        this.getGui().appendChild(eButtonsPanel);
    };
    ProvidedFilter.checkForDeprecatedParams = function (params) {
        var buttons = params.buttons || [];
        if (buttons.length > 0) {
            return;
        }
        var applyButton = params.applyButton, resetButton = params.resetButton, clearButton = params.clearButton;
        if (clearButton) {
            console.warn('ag-Grid: as of ag-Grid v23.2, filterParams.clearButton is deprecated. Please use filterParams.buttons instead');
            buttons.push('clear');
        }
        if (resetButton) {
            console.warn('ag-Grid: as of ag-Grid v23.2, filterParams.resetButton is deprecated. Please use filterParams.buttons instead');
            buttons.push('reset');
        }
        if (applyButton) {
            console.warn('ag-Grid: as of ag-Grid v23.2, filterParams.applyButton is deprecated. Please use filterParams.buttons instead');
            buttons.push('apply');
        }
        if (params.apply) {
            console.warn('ag-Grid: as of ag-Grid v21, filterParams.apply is deprecated. Please use filterParams.buttons instead');
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
        this.onBtApplyDebounce = debounce(this.onBtApply.bind(this), debounceMs);
    };
    ProvidedFilter.prototype.getModel = function () {
        return this.appliedModel;
    };
    ProvidedFilter.prototype.setModel = function (model) {
        var _this = this;
        var promise = model ? this.setModelIntoUi(model) : this.resetUiToDefaults();
        return promise.then(function () {
            _this.updateUiVisibility();
            // we set the model from the gui, rather than the provided model,
            // so the model is consistent. eg handling of null/undefined will be the same,
            // of if model is case insensitive, then casing is removed.
            _this.applyModel();
        });
    };
    ProvidedFilter.prototype.onBtCancel = function (e) {
        var _this = this;
        this.setModelIntoUi(this.getModel()).then(function () {
            _this.onUiChanged(false, 'prevent');
            if (_this.providedFilterParams.closeOnApply) {
                _this.close(e);
            }
        });
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
        if (closeOnApply && !afterFloatingFilter && this.applyActive) {
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
            setDisabled(this.getRefElement('applyFilterButton'), !isValid);
        }
        if ((fromFloatingFilter && !apply) || apply === 'immediately') {
            this.onBtApply(fromFloatingFilter);
        }
        else if ((!this.applyActive && !apply) || apply === 'debounce') {
            this.onBtApplyDebounce();
        }
    };
    ProvidedFilter.prototype.afterGuiAttached = function (params) {
        this.hidePopup = params.hidePopup;
    };
    // static, as used by floating filter also
    ProvidedFilter.getDebounceMs = function (params, debounceDefault) {
        if (ProvidedFilter.isUseApplyButton(params)) {
            if (params.debounceMs != null) {
                console.warn('ag-Grid: debounceMs is ignored when apply button is present');
            }
            return 0;
        }
        return params.debounceMs != null ? params.debounceMs : debounceDefault;
    };
    // static, as used by floating filter also
    ProvidedFilter.isUseApplyButton = function (params) {
        ProvidedFilter.checkForDeprecatedParams(params);
        return params.buttons && params.buttons.indexOf('apply') >= 0;
    };
    ProvidedFilter.prototype.destroy = function () {
        this.hidePopup = null;
        _super.prototype.destroy.call(this);
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], ProvidedFilter.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('rowModel')
    ], ProvidedFilter.prototype, "rowModel", void 0);
    __decorate([
        PostConstruct
    ], ProvidedFilter.prototype, "postConstruct", null);
    return ProvidedFilter;
}(Component));
export { ProvidedFilter };
