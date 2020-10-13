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
import { Autowired, Constants, Events, ProvidedFilter, RefSelector, VirtualList, Promise, _, KeyCode, } from '@ag-grid-community/core';
import { SetFilterModelValuesType, SetValueModel } from './setValueModel';
import { SetFilterListItem } from './setFilterListItem';
import { DEFAULT_LOCALE_TEXT } from './localeText';
var SetFilter = /** @class */ (function (_super) {
    __extends(SetFilter, _super);
    function SetFilter() {
        var _this = _super.call(this, 'setFilter') || this;
        // To make the filtering super fast, we store the values in an object, and check for the boolean value.
        // Although Set would be a more natural choice of data structure, its performance across browsers is
        // significantly worse than using an object: https://jsbench.me/hdk91jbw1h/
        _this.appliedModelValues = null;
        return _this;
    }
    // unlike the simple filters, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    SetFilter.prototype.updateUiVisibility = function () { };
    SetFilter.prototype.createBodyTemplate = function () {
        return /* html */ "\n            <div class=\"ag-set-filter\">\n                <div ref=\"eFilterLoading\" class=\"ag-filter-loading ag-hidden\">" + this.translateForSetFilter('loadingOoo') + "</div>\n                <ag-input-text-field class=\"ag-mini-filter\" ref=\"eMiniFilter\"></ag-input-text-field>\n                <div ref=\"eFilterNoMatches\" class=\"ag-filter-no-matches ag-hidden\">" + this.translateForSetFilter('noMatches') + "</div>\n                <div ref=\"eSetFilterList\" class=\"ag-set-filter-list\" role=\"presentation\"></div>\n            </div>";
    };
    SetFilter.prototype.handleKeyDown = function (e) {
        if (e.defaultPrevented) {
            return;
        }
        switch (e.which || e.keyCode) {
            case KeyCode.SPACE:
                this.handleKeySpace(e);
                break;
            case KeyCode.ENTER:
                this.handleKeyEnter(e);
                break;
        }
    };
    SetFilter.prototype.handleKeySpace = function (e) {
        if (!this.eSetFilterList.contains(document.activeElement)) {
            return;
        }
        var currentItem = this.virtualList.getLastFocusedRow();
        if (currentItem != null) {
            var component = this.virtualList.getComponentAt(currentItem);
            if (component) {
                e.preventDefault();
                component.toggleSelected();
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
        return { values: values, filterType: this.getFilterType() };
    };
    SetFilter.prototype.getModel = function () {
        return _super.prototype.getModel.call(this);
    };
    SetFilter.prototype.getFilterType = function () {
        return 'set';
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
        this.valueModel = new SetValueModel(params.rowModel, params.valueGetter, params, params.colDef, params.column, params.doesRowPassOtherFilter, params.suppressSorting, function (loading) { return _this.showOrHideLoadingScreen(loading); }, this.valueFormatterService, function (key) { return _this.translateForSetFilter(key); });
        this.initialiseFilterBodyUi();
        if (params.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE &&
            !params.values &&
            !params.suppressSyncValuesAfterDataChange) {
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
        var promise = Promise.resolve();
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
        this.showOrHideLoadingScreen(loading);
    };
    SetFilter.prototype.showOrHideLoadingScreen = function (isLoading) {
        _.setDisplayed(this.eFilterLoading, isLoading);
    };
    SetFilter.prototype.initialiseFilterBodyUi = function () {
        this.initVirtualList();
        this.initMiniFilter();
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
        var model;
        if (this.setFilterParams.suppressSelectAll) {
            model = new ModelWrapper(this.valueModel);
        }
        else {
            model = new ModelWrapperWithSelectAll(this.valueModel, function () { return _this.isSelectAllSelected(); });
        }
        virtualList.setModel(model);
    };
    SetFilter.prototype.getSelectAllLabel = function () {
        var key = this.valueModel.getMiniFilter() == null || !this.setFilterParams.excelMode ?
            'selectAll' : 'selectAllSearchResults';
        return this.translateForSetFilter(key);
    };
    SetFilter.prototype.createSetListItem = function (value) {
        var _this = this;
        if (value === SetFilter.SELECT_ALL_VALUE) {
            var listItem_1 = this.createBean(new SetFilterListItem(function () { return _this.getSelectAllLabel(); }, this.setFilterParams, function (key) { return _this.translateForSetFilter(key); }, this.isSelectAllSelected()));
            listItem_1.addEventListener(SetFilterListItem.EVENT_SELECTION_CHANGED, function (e) { return _this.onSelectAll(e.isSelected); });
            return listItem_1;
        }
        var listItem = this.createBean(new SetFilterListItem(value, this.setFilterParams, function (key) { return _this.translateForSetFilter(key); }, this.valueModel.isValueSelected(value)));
        listItem.addEventListener(SetFilterListItem.EVENT_SELECTION_CHANGED, function (e) { return _this.onItemSelected(value, e.isSelected); });
        return listItem;
    };
    SetFilter.prototype.initMiniFilter = function () {
        var _this = this;
        var eMiniFilter = this.eMiniFilter;
        _.setDisplayed(eMiniFilter.getGui(), !this.setFilterParams.suppressMiniFilter);
        eMiniFilter.setValue(this.valueModel.getMiniFilter());
        eMiniFilter.onValueChange(function () { return _this.onMiniFilterInput(); });
        eMiniFilter.setInputAriaLabel('Search filter values');
        this.addManagedListener(eMiniFilter.getInputElement(), 'keypress', function (e) { return _this.onMiniFilterKeyPress(e); });
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
        eMiniFilter.setInputPlaceholder(this.translateForSetFilter('searchOoo'));
        if (!params || !params.suppressFocus) {
            eMiniFilter.getFocusableElement().focus();
        }
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
        var _this = this;
        // don't block the current action when updating the values for this filter
        setTimeout(function () { return _this.valueModel.refreshAfterAnyFilterChanged().then(function () { return _this.refresh(); }); }, 0);
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
        this.showOrHideResults();
    };
    SetFilter.prototype.showOrHideResults = function () {
        var hideResults = this.valueModel.getMiniFilter() != null && this.valueModel.getDisplayedValueCount() < 1;
        _.setDisplayed(this.eNoMatches, hideResults);
        _.setDisplayed(this.eSetFilterList, !hideResults);
    };
    SetFilter.prototype.resetUiToActiveModel = function () {
        var _this = this;
        this.eMiniFilter.setValue(null, true);
        this.valueModel.setMiniFilter(null);
        this.setModelIntoUi(this.getModel()).then(function () { return _this.onUiChanged(false, 'prevent'); });
    };
    SetFilter.prototype.onMiniFilterKeyPress = function (e) {
        if (_.isKeyPressed(e, KeyCode.ENTER) && !this.setFilterParams.excelMode) {
            this.filterOnAllVisibleValues();
        }
    };
    SetFilter.prototype.filterOnAllVisibleValues = function (applyImmediately) {
        if (applyImmediately === void 0) { applyImmediately = true; }
        this.valueModel.selectAllMatchingMiniFilter(true);
        this.refresh();
        this.onUiChanged(false, applyImmediately ? 'immediately' : 'debounce');
        this.showOrHideResults();
    };
    SetFilter.prototype.focusRowIfAlive = function (rowIndex) {
        var _this = this;
        window.setTimeout(function () {
            if (_this.isAlive()) {
                _this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    };
    SetFilter.prototype.onSelectAll = function (isSelected) {
        if (isSelected) {
            this.valueModel.selectAllMatchingMiniFilter();
        }
        else {
            this.valueModel.deselectAllMatchingMiniFilter();
        }
        var focusedRow = this.virtualList.getLastFocusedRow();
        this.refresh();
        this.onUiChanged();
        this.focusRowIfAlive(focusedRow);
    };
    SetFilter.prototype.onItemSelected = function (value, isSelected) {
        if (isSelected) {
            this.valueModel.selectValue(value);
        }
        else {
            this.valueModel.deselectValue(value);
        }
        var focusedRow = this.virtualList.getLastFocusedRow();
        this.refresh();
        this.onUiChanged();
        this.focusRowIfAlive(focusedRow);
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
            this.refresh();
        }
    };
    SetFilter.prototype.translateForSetFilter = function (key) {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(key, DEFAULT_LOCALE_TEXT[key]);
    };
    SetFilter.prototype.isSelectAllSelected = function () {
        if (!this.setFilterParams.defaultToNothingSelected) {
            // everything selected by default
            if (this.valueModel.hasSelections() && this.valueModel.isNothingVisibleSelected()) {
                return false;
            }
            if (this.valueModel.isEverythingVisibleSelected()) {
                return true;
            }
        }
        else {
            // nothing selected by default
            if (this.valueModel.hasSelections() && this.valueModel.isEverythingVisibleSelected()) {
                return true;
            }
            if (this.valueModel.isNothingVisibleSelected()) {
                return false;
            }
        }
        return undefined;
    };
    SetFilter.prototype.destroy = function () {
        if (this.virtualList != null) {
            this.virtualList.destroy();
            this.virtualList = null;
        }
        _super.prototype.destroy.call(this);
    };
    SetFilter.SELECT_ALL_VALUE = '__AG_SELECT_ALL__';
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
        Autowired('valueFormatterService')
    ], SetFilter.prototype, "valueFormatterService", void 0);
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
    ModelWrapper.prototype.isRowSelected = function (index) {
        return this.model.isValueSelected(this.getRow(index));
    };
    return ModelWrapper;
}());
var ModelWrapperWithSelectAll = /** @class */ (function () {
    function ModelWrapperWithSelectAll(model, isSelectAllSelected) {
        this.model = model;
        this.isSelectAllSelected = isSelectAllSelected;
    }
    ModelWrapperWithSelectAll.prototype.getRowCount = function () {
        return this.model.getDisplayedValueCount() + 1;
    };
    ModelWrapperWithSelectAll.prototype.getRow = function (index) {
        return index === 0 ? SetFilter.SELECT_ALL_VALUE : this.model.getDisplayedValue(index - 1);
    };
    ModelWrapperWithSelectAll.prototype.isRowSelected = function (index) {
        return index === 0 ? this.isSelectAllSelected() : this.model.isValueSelected(this.getRow(index - 1));
    };
    return ModelWrapperWithSelectAll;
}());
