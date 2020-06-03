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
import { Autowired, Constants, Events, ProvidedFilter, RefSelector, VirtualList, Promise, _ } from '@ag-grid-community/core';
import { SetFilterModelValuesType, SetValueModel } from './setValueModel';
import { SetFilterListItem } from './setFilterListItem';
import { DEFAULT_LOCALE_TEXT } from './localeText';
var SetFilter = /** @class */ (function (_super) {
    __extends(SetFilter, _super);
    function SetFilter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // To make the filtering super fast, we store the values in an object, and check for the boolean value.
        // Although Set would be a more natural choice of data structure, its performance across browsers is
        // significantly worse than using an object: https://jsbench.me/hdk91jbw1h/
        _this.appliedModelValues = null;
        return _this;
    }
    // unlike the simple filters, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    SetFilter.prototype.updateUiVisibility = function () { };
    SetFilter.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        var focusableEl = this.getFocusableElement();
        if (focusableEl) {
            this.addManagedListener(focusableEl, 'keydown', this.handleKeyDown.bind(this));
        }
    };
    SetFilter.prototype.createBodyTemplate = function () {
        return /* html */ "\n            <div>\n                <div ref=\"eFilterLoading\" class=\"ag-filter-loading ag-hidden\">" + this.translate('loadingOoo') + "</div>\n                <div class=\"ag-filter-header-container\" role=\"presentation\">\n                    <ag-input-text-field class=\"ag-mini-filter\" ref=\"eMiniFilter\"></ag-input-text-field>\n                    <label ref=\"eSelectAllContainer\" class=\"ag-set-filter-item ag-set-filter-select-all\">\n                        <ag-checkbox ref=\"eSelectAll\" class=\"ag-set-filter-item-checkbox\"></ag-checkbox>\n                        <span ref=\"eSelectAllLabel\" class=\"ag-set-filter-item-value\"></span>\n                    </label>\n                </div>\n                <div ref=\"eFilterNoMatches\" class=\"ag-filter-no-matches ag-hidden\">" + this.translate('noMatches') + "</div>\n                <div ref=\"eSetFilterList\" class=\"ag-set-filter-list\" role=\"presentation\"></div>\n            </div>";
    };
    SetFilter.prototype.handleKeyDown = function (e) {
        if (e.defaultPrevented) {
            return;
        }
        switch (e.which || e.keyCode) {
            case Constants.KEY_TAB:
                this.handleKeyTab(e);
                break;
            case Constants.KEY_SPACE:
                this.handleKeySpace(e);
                break;
            case Constants.KEY_ENTER:
                this.handleKeyEnter(e);
                break;
        }
    };
    SetFilter.prototype.handleKeyTab = function (e) {
        if (!this.eSetFilterList.contains(document.activeElement)) {
            return;
        }
        var focusableElement = this.getFocusableElement();
        var method = e.shiftKey ? 'previousElementSibling' : 'nextElementSibling';
        var currentRoot = this.eSetFilterList;
        var nextRoot;
        while (currentRoot !== focusableElement && !nextRoot) {
            nextRoot = currentRoot[method];
            currentRoot = currentRoot.parentElement;
        }
        if (!nextRoot) {
            return;
        }
        if ((e.shiftKey && this.focusController.focusLastFocusableElement(nextRoot)) ||
            (!e.shiftKey && this.focusController.focusFirstFocusableElement(nextRoot))) {
            e.preventDefault();
        }
    };
    SetFilter.prototype.handleKeySpace = function (e) {
        if (!this.eSetFilterList.contains(document.activeElement)) {
            return;
        }
        var currentItem = this.virtualList.getLastFocusedRow();
        if (_.exists(currentItem)) {
            var component = this.virtualList.getComponentAt(currentItem);
            if (component) {
                e.preventDefault();
                component.setSelected(!component.isSelected(), true);
            }
        }
    };
    SetFilter.prototype.handleKeyEnter = function (e) {
        if (this.setFilterParams.excelMode) {
            e.preventDefault();
            // in Excel Mode, hitting Enter is the same as pressing the Apply button
            this.onBtApply(false, false, e);
            if (this.setFilterParams.excelMode === 'mac') {
                // in Mac version, select all the input text
                this.eMiniFilter.getInputElement().select();
            }
        }
    };
    SetFilter.prototype.getCssIdentifier = function () {
        return 'set-filter';
    };
    SetFilter.prototype.resetUiToDefaults = function () {
        var _this = this;
        this.setMiniFilter(null);
        return this.valueModel.setModel(null).then(function () { return _this.refresh(); });
    };
    SetFilter.prototype.setModelIntoUi = function (model) {
        var _this = this;
        this.setMiniFilter(null);
        if (model instanceof Array) {
            var message_1 = 'ag-Grid: The Set Filter Model is no longer an array and models as arrays are ' +
                'deprecated. Please check the docs on what the set filter model looks like. Future versions of ' +
                'ag-Grid will have the array version of the model removed.';
            _.doOnce(function () { return console.warn(message_1); }, 'setFilter.modelAsArray');
        }
        // also supporting old filter model for backwards compatibility
        var values = model == null ? null : (model instanceof Array ? model : model.values);
        return this.valueModel.setModel(values).then(function () { return _this.refresh(); });
    };
    SetFilter.prototype.getModelFromUi = function () {
        var values = this.valueModel.getModel();
        if (!values) {
            return null;
        }
        if (this.gridOptionsWrapper.isEnableOldSetFilterModel()) {
            // this is a hack, it breaks casting rules, to apply with old model
            return values;
        }
        return { values: values, filterType: 'set' };
    };
    SetFilter.prototype.getValueModel = function () {
        return this.valueModel;
    };
    SetFilter.prototype.areModelsEqual = function (a, b) {
        // both are missing
        if (a == null && b == null) {
            return true;
        }
        return a != null && b != null && _.areEqual(a.values, b.values);
    };
    SetFilter.prototype.setParams = function (params) {
        var _this = this;
        this.applyExcelModeOptions(params);
        _super.prototype.setParams.call(this, params);
        this.checkSetFilterDeprecatedParams(params);
        this.setFilterParams = params;
        this.valueModel = new SetValueModel(params.rowModel, params.colDef, params.column, params.valueGetter, params.doesRowPassOtherFilter, params.suppressSorting, function (loading) { return _this.setLoading(loading); }, this.valueFormatterService, function (key) { return _this.translate(key); });
        this.initialiseFilterBodyUi();
        var syncValuesAfterDataChange = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE &&
            !params.values &&
            !params.suppressSyncValuesAfterDataChange;
        if (syncValuesAfterDataChange) {
            this.addEventListenersForDataChanges();
        }
    };
    SetFilter.prototype.applyExcelModeOptions = function (params) {
        // apply default options to match Excel behaviour, unless they have already been specified
        if (params.excelMode === 'windows') {
            if (!params.buttons) {
                params.buttons = ['apply', 'cancel'];
            }
            if (params.closeOnApply == null) {
                params.closeOnApply = true;
            }
        }
        else if (params.excelMode === 'mac') {
            if (!params.buttons) {
                params.buttons = ['reset'];
            }
            if (params.applyMiniFilterWhileTyping == null) {
                params.applyMiniFilterWhileTyping = true;
            }
            if (params.debounceMs == null) {
                params.debounceMs = 500;
            }
        }
    };
    SetFilter.prototype.checkSetFilterDeprecatedParams = function (params) {
        if (params.syncValuesLikeExcel) {
            var message_2 = 'ag-Grid: since version 22.x, the Set Filter param syncValuesLikeExcel is no longer' +
                ' used as this is the default behaviour. To turn this default behaviour off, use the' +
                ' param suppressSyncValuesAfterDataChange';
            _.doOnce(function () { return console.warn(message_2); }, 'syncValuesLikeExcel deprecated');
        }
        if (params.selectAllOnMiniFilter) {
            var message_3 = 'ag-Grid: since version 22.x, the Set Filter param selectAllOnMiniFilter is no longer' +
                ' used as this is the default behaviour.';
            _.doOnce(function () { return console.warn(message_3); }, 'selectAllOnMiniFilter deprecated');
        }
        if (params.suppressSyncValuesAfterDataChange) {
            var message_4 = 'ag-Grid: since version 23.1, the Set Filter param suppressSyncValuesAfterDataChange has' +
                ' been deprecated and will be removed in a future major release.';
            _.doOnce(function () { return console.warn(message_4); }, 'suppressSyncValuesAfterDataChange deprecated');
        }
        if (params.suppressRemoveEntries) {
            var message_5 = 'ag-Grid: since version 23.1, the Set Filter param suppressRemoveEntries has' +
                ' been deprecated and will be removed in a future major release.';
            _.doOnce(function () { return console.warn(message_5); }, 'suppressRemoveEntries deprecated');
        }
    };
    SetFilter.prototype.addEventListenersForDataChanges = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, function () { return _this.syncAfterDataChange(); });
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, function (event) {
            // only interested in changes to do with this column
            if (event.column === _this.setFilterParams.column) {
                _this.syncAfterDataChange();
            }
        });
    };
    SetFilter.prototype.syncAfterDataChange = function (refreshValues, keepSelection) {
        var _this = this;
        if (refreshValues === void 0) { refreshValues = true; }
        if (keepSelection === void 0) { keepSelection = true; }
        var promise = Promise.resolve(null);
        if (refreshValues) {
            promise = this.valueModel.refreshValues(keepSelection);
        }
        else if (!keepSelection) {
            promise = this.valueModel.setModel(null);
        }
        promise.then(function () {
            _this.refresh();
            _this.onBtApply(false, true);
        });
    };
    /** @deprecated since version 23.2. The loading screen is displayed automatically when the set filter is retrieving values. */
    SetFilter.prototype.setLoading = function (loading) {
        var message = 'ag-Grid: since version 23.2, setLoading has been deprecated. The loading screen is displayed automatically when the set filter is retrieving values.';
        _.doOnce(function () { return console.warn(message); }, 'setFilter.setLoading');
        _.setDisplayed(this.eFilterLoading, loading);
    };
    SetFilter.prototype.initialiseFilterBodyUi = function () {
        this.initVirtualList();
        this.initMiniFilter();
        this.initSelectAll();
    };
    SetFilter.prototype.initVirtualList = function () {
        var _this = this;
        var virtualList = this.virtualList = this.createBean(new VirtualList('filter'));
        var eSetFilterList = this.getRefElement('eSetFilterList');
        if (eSetFilterList) {
            eSetFilterList.appendChild(virtualList.getGui());
        }
        var cellHeight = this.setFilterParams.cellHeight;
        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }
        virtualList.setComponentCreator(function (value) { return _this.createSetListItem(value); });
        virtualList.setModel(new ModelWrapper(this.valueModel));
    };
    SetFilter.prototype.createSetListItem = function (value) {
        var _this = this;
        var listItem = this.createBean(new SetFilterListItem(value, this.setFilterParams, function (key) { return _this.translate(key); }));
        var selected = this.valueModel.isValueSelected(value);
        listItem.setSelected(selected);
        listItem.addEventListener(SetFilterListItem.EVENT_SELECTED, function () { return _this.onItemSelected(value, listItem.isSelected()); });
        return listItem;
    };
    SetFilter.prototype.initMiniFilter = function () {
        var _this = this;
        var eMiniFilter = this.eMiniFilter;
        _.setDisplayed(eMiniFilter.getGui(), !this.setFilterParams.suppressMiniFilter);
        eMiniFilter.setValue(this.valueModel.getMiniFilter());
        eMiniFilter.onValueChange(function () { return _this.onMiniFilterInput(); });
        this.addManagedListener(eMiniFilter.getInputElement(), 'keypress', function (e) { return _this.onMiniFilterKeyPress(e); });
    };
    SetFilter.prototype.initSelectAll = function () {
        var _this = this;
        if (this.setFilterParams.suppressSelectAll) {
            _.setDisplayed(this.eSelectAllContainer, false);
        }
        else {
            this.eSelectAll.onValueChange(function () { return _this.onSelectAll(); });
        }
    };
    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    SetFilter.prototype.afterGuiAttached = function (params) {
        _super.prototype.afterGuiAttached.call(this, params);
        this.refreshVirtualList();
        if (this.setFilterParams.excelMode) {
            this.resetUiToActiveModel();
        }
        var eMiniFilter = this.eMiniFilter;
        eMiniFilter.setInputPlaceholder(this.translate('searchOoo'));
        eMiniFilter.getFocusableElement().focus();
    };
    SetFilter.prototype.applyModel = function () {
        var _this = this;
        if (this.setFilterParams.excelMode && this.valueModel.isEverythingVisibleSelected()) {
            // In Excel, if the filter is applied with all visible values selected, then any active filter on the
            // column is removed. This ensures the filter is removed in this situation.
            this.valueModel.selectAllMatchingMiniFilter();
        }
        var result = _super.prototype.applyModel.call(this);
        if (result) {
            // keep appliedModelValues in sync with the applied model
            var appliedModel = this.getModel();
            if (appliedModel) {
                this.appliedModelValues = {};
                _.forEach(appliedModel.values, function (value) { return _this.appliedModelValues[value] = true; });
            }
            else {
                this.appliedModelValues = null;
            }
        }
        return result;
    };
    SetFilter.prototype.isModelValid = function (model) {
        return this.setFilterParams.excelMode ? model == null || model.values.length > 0 : true;
    };
    SetFilter.prototype.doesFilterPass = function (params) {
        var _this = this;
        if (this.appliedModelValues == null) {
            return true;
        }
        var _a = this.setFilterParams, valueGetter = _a.valueGetter, keyCreator = _a.colDef.keyCreator;
        var value = valueGetter(params.node);
        if (keyCreator) {
            value = keyCreator({ value: value });
        }
        value = _.makeNull(value);
        if (Array.isArray(value)) {
            return _.some(value, function (v) { return _this.appliedModelValues[_.makeNull(v)] === true; });
        }
        // Comparing against a value performs better than just checking for undefined
        // https://jsbench.me/hdk91jbw1h/
        return this.appliedModelValues[value] === true;
    };
    SetFilter.prototype.onNewRowsLoaded = function () {
        var valuesType = this.valueModel.getValuesType();
        var keepSelection = this.isNewRowsActionKeep();
        this.syncAfterDataChange(valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES, keepSelection);
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param options The options to use.
     */
    SetFilter.prototype.setFilterValues = function (options) {
        var _this = this;
        this.valueModel.overrideValues(options, this.isNewRowsActionKeep()).then(function () {
            _this.refresh();
            _this.onUiChanged();
        });
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started.
     */
    SetFilter.prototype.resetFilterValues = function () {
        this.valueModel.setValuesType(SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES);
        this.syncAfterDataChange(true, this.isNewRowsActionKeep());
    };
    SetFilter.prototype.refreshFilterValues = function () {
        var _this = this;
        this.valueModel.refreshValues().then(function () {
            _this.refresh();
            _this.onUiChanged();
        });
    };
    SetFilter.prototype.onAnyFilterChanged = function () {
        this.valueModel.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    };
    SetFilter.prototype.updateSelectAllCheckbox = function () {
        if (this.valueModel.isEverythingVisibleSelected()) {
            this.selectAllState = true;
        }
        else if (this.valueModel.isNothingVisibleSelected()) {
            this.selectAllState = false;
        }
        else {
            this.selectAllState = undefined;
        }
        this.eSelectAll.setValue(this.selectAllState, true);
    };
    SetFilter.prototype.onMiniFilterInput = function () {
        if (this.valueModel.setMiniFilter(this.eMiniFilter.getValue())) {
            if (this.setFilterParams.applyMiniFilterWhileTyping) {
                this.filterOnAllVisibleValues(false);
            }
            else {
                this.updateUiAfterMiniFilterChange();
            }
        }
    };
    SetFilter.prototype.updateUiAfterMiniFilterChange = function () {
        if (this.setFilterParams.excelMode) {
            if (this.valueModel.getMiniFilter() == null) {
                this.resetUiToActiveModel();
            }
            else {
                this.valueModel.selectAllMatchingMiniFilter(true);
                this.refresh();
                this.onUiChanged();
            }
        }
        else {
            this.refresh();
        }
        var hideResults = this.valueModel.getMiniFilter() != null && this.valueModel.getDisplayedValueCount() < 1;
        _.setDisplayed(this.eNoMatches, hideResults);
        if (!this.setFilterParams.suppressSelectAll) {
            _.setDisplayed(this.eSelectAllContainer, !hideResults);
        }
    };
    SetFilter.prototype.resetUiToActiveModel = function () {
        var _this = this;
        this.eMiniFilter.setValue(null, true);
        this.valueModel.setMiniFilter(null);
        this.setModelIntoUi(this.getModel()).then(function () { return _this.onUiChanged(false, 'prevent'); });
    };
    SetFilter.prototype.updateSelectAllLabel = function () {
        var label = this.valueModel.getMiniFilter() == null || !this.setFilterParams.excelMode ?
            this.translate('selectAll') :
            this.translate('selectAllSearchResults');
        this.eSelectAllLabel.innerText = "(" + label + ")";
    };
    SetFilter.prototype.onMiniFilterKeyPress = function (e) {
        if (_.isKeyPressed(e, Constants.KEY_ENTER) && !this.setFilterParams.excelMode) {
            this.filterOnAllVisibleValues();
        }
    };
    SetFilter.prototype.filterOnAllVisibleValues = function (applyImmediately) {
        if (applyImmediately === void 0) { applyImmediately = true; }
        this.valueModel.selectAllMatchingMiniFilter(true);
        this.refresh();
        this.onUiChanged(false, applyImmediately ? 'immediately' : 'debounce');
    };
    SetFilter.prototype.onSelectAll = function () {
        this.selectAllState = !this.selectAllState;
        if (this.selectAllState) {
            this.valueModel.selectAllMatchingMiniFilter();
        }
        else {
            this.valueModel.deselectAllMatchingMiniFilter();
        }
        this.refresh();
        this.onUiChanged();
    };
    SetFilter.prototype.onItemSelected = function (value, selected) {
        var _this = this;
        if (selected) {
            this.valueModel.selectValue(value);
        }
        else {
            this.valueModel.deselectValue(value);
        }
        var focusedRow = this.virtualList.getLastFocusedRow();
        this.updateSelectAllCheckbox();
        this.onUiChanged();
        if (_.exists(focusedRow)) {
            window.setTimeout(function () {
                if (_this.isAlive()) {
                    _this.virtualList.focusRow(focusedRow);
                }
            }, 10);
        }
    };
    SetFilter.prototype.setMiniFilter = function (newMiniFilter) {
        this.eMiniFilter.setValue(newMiniFilter);
        this.onMiniFilterInput();
    };
    SetFilter.prototype.getMiniFilter = function () {
        return this.valueModel.getMiniFilter();
    };
    /** @deprecated since version 23.2. Please use setModel instead. */
    SetFilter.prototype.selectEverything = function () {
        var message = 'ag-Grid: since version 23.2, selectEverything has been deprecated. Please use setModel instead.';
        _.doOnce(function () { return console.warn(message); }, 'setFilter.selectEverything');
        this.valueModel.selectAllMatchingMiniFilter();
        this.refresh();
    };
    /** @deprecated since version 23.2. Please use setModel instead. */
    SetFilter.prototype.selectNothing = function () {
        var message = 'ag-Grid: since version 23.2, selectNothing has been deprecated. Please use setModel instead.';
        _.doOnce(function () { return console.warn(message); }, 'setFilter.selectNothing');
        this.valueModel.deselectAllMatchingMiniFilter();
        this.refresh();
    };
    /** @deprecated since version 23.2. Please use setModel instead. */
    SetFilter.prototype.unselectValue = function (value) {
        var message = 'ag-Grid: since version 23.2, unselectValue has been deprecated. Please use setModel instead.';
        _.doOnce(function () { return console.warn(message); }, 'setFilter.unselectValue');
        this.valueModel.deselectValue(value);
        this.refresh();
    };
    /** @deprecated since version 23.2. Please use setModel instead. */
    SetFilter.prototype.selectValue = function (value) {
        var message = 'ag-Grid: since version 23.2, selectValue has been deprecated. Please use setModel instead.';
        _.doOnce(function () { return console.warn(message); }, 'setFilter.selectValue');
        this.valueModel.selectValue(value);
        this.refresh();
    };
    SetFilter.prototype.refresh = function () {
        this.virtualList.refresh();
        this.updateSelectAllCheckbox();
        this.updateSelectAllLabel();
    };
    /** @deprecated since version 23.2. Please use getModel instead. */
    SetFilter.prototype.isValueSelected = function (value) {
        var message = 'ag-Grid: since version 23.2, isValueSelected has been deprecated. Please use getModel instead.';
        _.doOnce(function () { return console.warn(message); }, 'setFilter.isValueSelected');
        return this.valueModel.isValueSelected(value);
    };
    /** @deprecated since version 23.2. Please use getModel instead. */
    SetFilter.prototype.isEverythingSelected = function () {
        var message = 'ag-Grid: since version 23.2, isEverythingSelected has been deprecated. Please use getModel instead.';
        _.doOnce(function () { return console.warn(message); }, 'setFilter.isEverythingSelected');
        return this.valueModel.isEverythingVisibleSelected();
    };
    /** @deprecated since version 23.2. Please use getModel instead. */
    SetFilter.prototype.isNothingSelected = function () {
        var message = 'ag-Grid: since version 23.2, isNothingSelected has been deprecated. Please use getModel instead.';
        _.doOnce(function () { return console.warn(message); }, 'setFilter.isNothingSelected');
        return this.valueModel.isNothingVisibleSelected();
    };
    /** @deprecated since version 23.2. Please use getValues instead. */
    SetFilter.prototype.getUniqueValueCount = function () {
        var message = 'ag-Grid: since version 23.2, getUniqueValueCount has been deprecated. Please use getValues instead.';
        _.doOnce(function () { return console.warn(message); }, 'setFilter.getUniqueValueCount');
        return this.valueModel.getUniqueValueCount();
    };
    /** @deprecated since version 23.2. Please use getValues instead. */
    SetFilter.prototype.getUniqueValue = function (index) {
        var message = 'ag-Grid: since version 23.2, getUniqueValue has been deprecated. Please use getValues instead.';
        _.doOnce(function () { return console.warn(message); }, 'setFilter.getUniqueValue');
        return this.valueModel.getUniqueValue(index);
    };
    SetFilter.prototype.getValues = function () {
        return this.valueModel.getValues();
    };
    SetFilter.prototype.refreshVirtualList = function () {
        if (this.setFilterParams.refreshValuesOnOpen) {
            this.refreshFilterValues();
        }
        else {
            this.virtualList.refresh();
        }
    };
    SetFilter.prototype.translate = function (key) {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(key, DEFAULT_LOCALE_TEXT[key]);
    };
    __decorate([
        RefSelector('eSelectAll')
    ], SetFilter.prototype, "eSelectAll", void 0);
    __decorate([
        RefSelector('eSelectAllLabel')
    ], SetFilter.prototype, "eSelectAllLabel", void 0);
    __decorate([
        RefSelector('eMiniFilter')
    ], SetFilter.prototype, "eMiniFilter", void 0);
    __decorate([
        RefSelector('eFilterLoading')
    ], SetFilter.prototype, "eFilterLoading", void 0);
    __decorate([
        RefSelector('eSetFilterList')
    ], SetFilter.prototype, "eSetFilterList", void 0);
    __decorate([
        RefSelector('eFilterNoMatches')
    ], SetFilter.prototype, "eNoMatches", void 0);
    __decorate([
        RefSelector('eSelectAllContainer')
    ], SetFilter.prototype, "eSelectAllContainer", void 0);
    __decorate([
        Autowired('valueFormatterService')
    ], SetFilter.prototype, "valueFormatterService", void 0);
    __decorate([
        Autowired('focusController')
    ], SetFilter.prototype, "focusController", void 0);
    return SetFilter;
}(ProvidedFilter));
export { SetFilter };
var ModelWrapper = /** @class */ (function () {
    function ModelWrapper(model) {
        this.model = model;
    }
    ModelWrapper.prototype.getRowCount = function () {
        return this.model.getDisplayedValueCount();
    };
    ModelWrapper.prototype.getRow = function (index) {
        return this.model.getDisplayedValue(index);
    };
    return ModelWrapper;
}());
