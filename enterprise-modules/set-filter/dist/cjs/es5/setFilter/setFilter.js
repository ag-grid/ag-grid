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
var core_1 = require("@ag-grid-community/core");
var setValueModel_1 = require("./setValueModel");
var setFilterListItem_1 = require("./setFilterListItem");
var localeText_1 = require("./localeText");
var SetFilter = /** @class */ (function (_super) {
    __extends(SetFilter, _super);
    function SetFilter() {
        var _this = _super.call(this, 'setFilter') || this;
        _this.valueModel = null;
        _this.setFilterParams = null;
        _this.virtualList = null;
        _this.caseSensitive = false;
        // To make the filtering super fast, we store the values in an object, and check for the boolean value.
        // Although Set would be a more natural choice of data structure, its performance across browsers is
        // significantly worse than using an object: https://jsbench.me/hdk91jbw1h/
        _this.appliedModelValues = null;
        return _this;
    }
    SetFilter.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        this.positionableFeature = new core_1.PositionableFeature(this.eSetFilterList, { forcePopupParentAsOffsetParent: true });
        this.createBean(this.positionableFeature);
    };
    // unlike the simple filters, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    SetFilter.prototype.updateUiVisibility = function () { };
    SetFilter.prototype.createBodyTemplate = function () {
        return /* html */ "\n            <div class=\"ag-set-filter\">\n                <div ref=\"eFilterLoading\" class=\"ag-filter-loading ag-hidden\">" + this.translateForSetFilter('loadingOoo') + "</div>\n                <ag-input-text-field class=\"ag-mini-filter\" ref=\"eMiniFilter\"></ag-input-text-field>\n                <div ref=\"eFilterNoMatches\" class=\"ag-filter-no-matches ag-hidden\">" + this.translateForSetFilter('noMatches') + "</div>\n                <div ref=\"eSetFilterList\" class=\"ag-set-filter-list\" role=\"presentation\"></div>\n            </div>";
    };
    SetFilter.prototype.handleKeyDown = function (e) {
        _super.prototype.handleKeyDown.call(this, e);
        if (e.defaultPrevented) {
            return;
        }
        switch (e.key) {
            case core_1.KeyCode.SPACE:
                this.handleKeySpace(e);
                break;
            case core_1.KeyCode.ENTER:
                this.handleKeyEnter(e);
                break;
        }
    };
    SetFilter.prototype.handleKeySpace = function (e) {
        var eDocument = this.gridOptionsWrapper.getDocument();
        if (!this.eSetFilterList.contains(eDocument.activeElement) || !this.virtualList) {
            return;
        }
        var currentItem = this.virtualList.getLastFocusedRow();
        if (currentItem == null) {
            return;
        }
        var component = this.virtualList.getComponentAt(currentItem);
        if (component == null) {
            return;
        }
        e.preventDefault();
        var readOnly = (this.setFilterParams || {}).readOnly;
        if (!!readOnly) {
            return;
        }
        component.toggleSelected();
    };
    SetFilter.prototype.handleKeyEnter = function (e) {
        if (!this.setFilterParams) {
            return;
        }
        var _a = this.setFilterParams || {}, excelMode = _a.excelMode, readOnly = _a.readOnly;
        if (!excelMode || !!readOnly) {
            return;
        }
        e.preventDefault();
        // in Excel Mode, hitting Enter is the same as pressing the Apply button
        this.onBtApply(false, false, e);
        if (this.setFilterParams.excelMode === 'mac') {
            // in Mac version, select all the input text
            this.eMiniFilter.getInputElement().select();
        }
    };
    SetFilter.prototype.getCssIdentifier = function () {
        return 'set-filter';
    };
    SetFilter.prototype.setModelAndRefresh = function (values) {
        var _this = this;
        return this.valueModel ? this.valueModel.setModel(values).then(function () { return _this.refresh(); }) : core_1.AgPromise.resolve();
    };
    SetFilter.prototype.resetUiToDefaults = function () {
        this.setMiniFilter(null);
        return this.setModelAndRefresh(null);
    };
    SetFilter.prototype.setModelIntoUi = function (model) {
        this.setMiniFilter(null);
        var values = model == null ? null : model.values;
        return this.setModelAndRefresh(values);
    };
    SetFilter.prototype.getModelFromUi = function () {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var values = this.valueModel.getModel();
        if (!values) {
            return null;
        }
        return { values: values, filterType: this.getFilterType() };
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
        return a != null && b != null && core_1._.areEqual(a.values, b.values);
    };
    SetFilter.prototype.setParams = function (params) {
        var _this = this;
        this.applyExcelModeOptions(params);
        _super.prototype.setParams.call(this, params);
        this.setFilterParams = params;
        this.caseSensitive = params.caseSensitive || false;
        this.valueModel = new setValueModel_1.SetValueModel(params, function (loading) { return _this.showOrHideLoadingScreen(loading); }, this.valueFormatterService, function (key) { return _this.translateForSetFilter(key); }, function (v) { return _this.caseFormat(v); });
        this.initialiseFilterBodyUi();
        this.addEventListenersForDataChanges();
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
    SetFilter.prototype.addEventListenersForDataChanges = function () {
        var _this = this;
        if (!this.isValuesTakenFromGrid()) {
            return;
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_CELL_VALUE_CHANGED, function (event) {
            // only interested in changes to do with this column
            if (_this.setFilterParams && event.column === _this.setFilterParams.column) {
                _this.syncAfterDataChange();
            }
        });
    };
    SetFilter.prototype.syncAfterDataChange = function () {
        var _this = this;
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var promise = this.valueModel.refreshValues();
        return promise.then(function () {
            _this.refresh();
            _this.onBtApply(false, true);
        });
    };
    SetFilter.prototype.showOrHideLoadingScreen = function (isLoading) {
        core_1._.setDisplayed(this.eFilterLoading, isLoading);
    };
    SetFilter.prototype.initialiseFilterBodyUi = function () {
        this.initVirtualList();
        this.initMiniFilter();
    };
    SetFilter.prototype.initVirtualList = function () {
        var _this = this;
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var filterListName = translate('ariaFilterList', 'Filter List');
        var virtualList = this.virtualList = this.createBean(new core_1.VirtualList('filter', 'listbox', filterListName));
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
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var key = this.valueModel.getMiniFilter() == null || !this.setFilterParams.excelMode ?
            'selectAll' : 'selectAllSearchResults';
        return this.translateForSetFilter(key);
    };
    SetFilter.prototype.createSetListItem = function (value) {
        var _this = this;
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var listItem;
        if (value === SetFilter.SELECT_ALL_VALUE) {
            listItem = this.createBean(new setFilterListItem_1.SetFilterListItem(function () { return _this.getSelectAllLabel(); }, this.setFilterParams, function (key) { return _this.translateForSetFilter(key); }, this.isSelectAllSelected()));
            listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_SELECTION_CHANGED, function (e) { return _this.onSelectAll(e.isSelected); });
            return listItem;
        }
        listItem = this.createBean(new setFilterListItem_1.SetFilterListItem(value, this.setFilterParams, function (key) { return _this.translateForSetFilter(key); }, this.valueModel.isValueSelected(value)));
        listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_SELECTION_CHANGED, function (e) { return _this.onItemSelected(value, e.isSelected); });
        return listItem;
    };
    SetFilter.prototype.initMiniFilter = function () {
        var _this = this;
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var _a = this, eMiniFilter = _a.eMiniFilter, gridOptionsWrapper = _a.gridOptionsWrapper;
        var translate = gridOptionsWrapper.getLocaleTextFunc();
        eMiniFilter.setDisplayed(!this.setFilterParams.suppressMiniFilter);
        eMiniFilter.setValue(this.valueModel.getMiniFilter());
        eMiniFilter.onValueChange(function () { return _this.onMiniFilterInput(); });
        eMiniFilter.setInputAriaLabel(translate('ariaSearchFilterValues', 'Search filter values'));
        this.addManagedListener(eMiniFilter.getInputElement(), 'keypress', function (e) { return _this.onMiniFilterKeyPress(e); });
    };
    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    SetFilter.prototype.afterGuiAttached = function (params) {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        _super.prototype.afterGuiAttached.call(this, params);
        if (this.setFilterParams.excelMode) {
            this.resetUiToActiveModel();
            this.showOrHideResults();
        }
        this.refreshVirtualList();
        var eMiniFilter = this.eMiniFilter;
        eMiniFilter.setInputPlaceholder(this.translateForSetFilter('searchOoo'));
        if (!params || !params.suppressFocus) {
            eMiniFilter.getFocusableElement().focus();
        }
        var resizable = !!(params && params.container === 'floatingFilter');
        var resizableObject;
        if (this.gridOptionsWrapper.isEnableRtl()) {
            resizableObject = { bottom: true, bottomLeft: true, left: true };
        }
        else {
            resizableObject = { bottom: true, bottomRight: true, right: true };
        }
        if (resizable) {
            this.positionableFeature.restoreLastSize();
            this.positionableFeature.setResizable(resizableObject);
        }
        else {
            this.positionableFeature.removeSizeFromEl();
            this.positionableFeature.setResizable(false);
        }
    };
    SetFilter.prototype.applyModel = function () {
        var _this = this;
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (this.setFilterParams.excelMode && this.valueModel.isEverythingVisibleSelected()) {
            // In Excel, if the filter is applied with all visible values selected, then any active filter on the
            // column is removed. This ensures the filter is removed in this situation.
            this.valueModel.selectAllMatchingMiniFilter();
        }
        var result = _super.prototype.applyModel.call(this);
        // keep appliedModelValues in sync with the applied model
        var appliedModel = this.getModel();
        if (appliedModel) {
            this.appliedModelValues = appliedModel.values.reduce(function (values, value) {
                values[_this.caseFormat(String(value))] = true;
                return values;
            }, {});
        }
        else {
            this.appliedModelValues = null;
        }
        return result;
    };
    SetFilter.prototype.isModelValid = function (model) {
        return this.setFilterParams && this.setFilterParams.excelMode ? model == null || model.values.length > 0 : true;
    };
    SetFilter.prototype.doesFilterPass = function (params) {
        var _this = this;
        if (!this.setFilterParams || !this.valueModel || !this.appliedModelValues) {
            return true;
        }
        var node = params.node, data = params.data;
        var _a = this.setFilterParams, valueGetter = _a.valueGetter, keyCreator = _a.colDef.keyCreator, api = _a.api, colDef = _a.colDef, column = _a.column, columnApi = _a.columnApi, context = _a.context;
        var value = valueGetter({
            api: api,
            colDef: colDef,
            column: column,
            columnApi: columnApi,
            context: context,
            data: data,
            getValue: function (field) { return data[field]; },
            node: node,
        });
        if (keyCreator) {
            var keyParams = {
                value: value,
                colDef: colDef,
                column: column,
                node: node,
                data: data,
                api: api,
                columnApi: columnApi,
                context: context,
            };
            value = keyCreator(keyParams);
        }
        value = core_1._.makeNull(value);
        if (Array.isArray(value)) {
            return value.some(function (v) { return _this.appliedModelValues[_this.caseFormat(String(core_1._.makeNull(v)))] === true; });
        }
        // Comparing against a value performs better than just checking for undefined
        // https://jsbench.me/hdk91jbw1h/
        return this.appliedModelValues[this.caseFormat(String(value))] === true;
    };
    SetFilter.prototype.onNewRowsLoaded = function () {
        if (!this.isValuesTakenFromGrid()) {
            return;
        }
        this.syncAfterDataChange();
    };
    SetFilter.prototype.isValuesTakenFromGrid = function () {
        if (!this.valueModel) {
            return false;
        }
        var valuesType = this.valueModel.getValuesType();
        return valuesType === setValueModel_1.SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param options The options to use.
     */
    SetFilter.prototype.setFilterValues = function (options) {
        var _this = this;
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.valueModel.overrideValues(options).then(function () {
            _this.refresh();
            _this.onUiChanged();
        });
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started.
     */
    SetFilter.prototype.resetFilterValues = function () {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.valueModel.setValuesType(setValueModel_1.SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES);
        this.syncAfterDataChange();
    };
    SetFilter.prototype.refreshFilterValues = function () {
        var _this = this;
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        // the model is still being initialised
        if (!this.valueModel.isInitialised()) {
            return;
        }
        this.valueModel.refreshValues().then(function () {
            _this.refresh();
            _this.onUiChanged();
        });
    };
    SetFilter.prototype.onAnyFilterChanged = function () {
        var _this = this;
        // don't block the current action when updating the values for this filter
        setTimeout(function () {
            if (!_this.isAlive()) {
                return;
            }
            if (!_this.valueModel) {
                throw new Error('Value model has not been created.');
            }
            _this.valueModel.refreshAfterAnyFilterChanged().then(function () { return _this.refresh(); });
        }, 0);
    };
    SetFilter.prototype.onMiniFilterInput = function () {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!this.valueModel.setMiniFilter(this.eMiniFilter.getValue())) {
            return;
        }
        var _a = this.setFilterParams || {}, applyMiniFilterWhileTyping = _a.applyMiniFilterWhileTyping, readOnly = _a.readOnly;
        if (!readOnly && applyMiniFilterWhileTyping) {
            this.filterOnAllVisibleValues(false);
        }
        else {
            this.updateUiAfterMiniFilterChange();
        }
    };
    SetFilter.prototype.updateUiAfterMiniFilterChange = function () {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var _a = this.setFilterParams || {}, excelMode = _a.excelMode, readOnly = _a.readOnly;
        if (excelMode == null || !!readOnly) {
            this.refresh();
        }
        else if (this.valueModel.getMiniFilter() == null) {
            this.resetUiToActiveModel();
        }
        else {
            this.valueModel.selectAllMatchingMiniFilter(true);
            this.refresh();
            this.onUiChanged();
        }
        this.showOrHideResults();
    };
    SetFilter.prototype.showOrHideResults = function () {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var hideResults = this.valueModel.getMiniFilter() != null && this.valueModel.getDisplayedValueCount() < 1;
        core_1._.setDisplayed(this.eNoMatches, hideResults);
        core_1._.setDisplayed(this.eSetFilterList, !hideResults);
    };
    SetFilter.prototype.resetUiToActiveModel = function () {
        var _this = this;
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.eMiniFilter.setValue(null, true);
        this.valueModel.setMiniFilter(null);
        this.setModelIntoUi(this.getModel()).then(function () { return _this.onUiChanged(false, 'prevent'); });
    };
    SetFilter.prototype.onMiniFilterKeyPress = function (e) {
        var _a = this.setFilterParams || {}, excelMode = _a.excelMode, readOnly = _a.readOnly;
        if (e.key === core_1.KeyCode.ENTER && !excelMode && !readOnly) {
            this.filterOnAllVisibleValues();
        }
    };
    SetFilter.prototype.filterOnAllVisibleValues = function (applyImmediately) {
        if (applyImmediately === void 0) { applyImmediately = true; }
        var readOnly = (this.setFilterParams || {}).readOnly;
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!!readOnly) {
            throw new Error('Unable to filter in readOnly mode.');
        }
        this.valueModel.selectAllMatchingMiniFilter(true);
        this.refresh();
        this.onUiChanged(false, applyImmediately ? 'immediately' : 'debounce');
        this.showOrHideResults();
    };
    SetFilter.prototype.focusRowIfAlive = function (rowIndex) {
        var _this = this;
        if (rowIndex == null) {
            return;
        }
        window.setTimeout(function () {
            if (!_this.virtualList) {
                throw new Error('Virtual list has not been created.');
            }
            if (_this.isAlive()) {
                _this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    };
    SetFilter.prototype.onSelectAll = function (isSelected) {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!this.virtualList) {
            throw new Error('Virtual list has not been created.');
        }
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
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!this.virtualList) {
            throw new Error('Virtual list has not been created.');
        }
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
        return this.valueModel ? this.valueModel.getMiniFilter() : null;
    };
    SetFilter.prototype.refresh = function () {
        if (!this.virtualList) {
            throw new Error('Virtual list has not been created.');
        }
        this.virtualList.refresh();
    };
    SetFilter.prototype.getValues = function () {
        return this.valueModel ? this.valueModel.getValues() : [];
    };
    SetFilter.prototype.refreshVirtualList = function () {
        if (this.setFilterParams && this.setFilterParams.refreshValuesOnOpen) {
            this.refreshFilterValues();
        }
        else {
            this.refresh();
        }
    };
    SetFilter.prototype.translateForSetFilter = function (key) {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(key, localeText_1.DEFAULT_LOCALE_TEXT[key]);
    };
    SetFilter.prototype.isSelectAllSelected = function () {
        if (!this.setFilterParams || !this.valueModel) {
            return false;
        }
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
        // returning `undefined` means the checkbox status is indeterminate.
        return undefined;
    };
    SetFilter.prototype.destroy = function () {
        if (this.virtualList != null) {
            this.virtualList.destroy();
            this.virtualList = null;
        }
        _super.prototype.destroy.call(this);
    };
    SetFilter.prototype.caseFormat = function (valueToFormat) {
        if (valueToFormat == null || typeof valueToFormat !== 'string') {
            return valueToFormat;
        }
        return this.caseSensitive ? valueToFormat : valueToFormat.toUpperCase();
    };
    SetFilter.SELECT_ALL_VALUE = '__AG_SELECT_ALL__';
    __decorate([
        core_1.RefSelector('eMiniFilter')
    ], SetFilter.prototype, "eMiniFilter", void 0);
    __decorate([
        core_1.RefSelector('eFilterLoading')
    ], SetFilter.prototype, "eFilterLoading", void 0);
    __decorate([
        core_1.RefSelector('eSetFilterList')
    ], SetFilter.prototype, "eSetFilterList", void 0);
    __decorate([
        core_1.RefSelector('eFilterNoMatches')
    ], SetFilter.prototype, "eNoMatches", void 0);
    __decorate([
        core_1.Autowired('valueFormatterService')
    ], SetFilter.prototype, "valueFormatterService", void 0);
    return SetFilter;
}(core_1.ProvidedFilter));
exports.SetFilter = SetFilter;
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
        return index === 0 ? this.isSelectAllSelected() : this.model.isValueSelected(this.getRow(index));
    };
    return ModelWrapperWithSelectAll;
}());
