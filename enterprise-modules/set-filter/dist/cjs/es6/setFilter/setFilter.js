"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const setValueModel_1 = require("./setValueModel");
const setFilterListItem_1 = require("./setFilterListItem");
const localeText_1 = require("./localeText");
class SetFilter extends core_1.ProvidedFilter {
    constructor() {
        super('setFilter');
        this.valueModel = null;
        this.setFilterParams = null;
        this.virtualList = null;
        this.caseSensitive = false;
        // To make the filtering super fast, we store the values in an object, and check for the boolean value.
        // Although Set would be a more natural choice of data structure, its performance across browsers is
        // significantly worse than using an object: https://jsbench.me/hdk91jbw1h/
        this.appliedModelValues = null;
    }
    postConstruct() {
        super.postConstruct();
        this.positionableFeature = new core_1.PositionableFeature(this.eSetFilterList, { forcePopupParentAsOffsetParent: true });
        this.createBean(this.positionableFeature);
    }
    // unlike the simple filters, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    updateUiVisibility() { }
    createBodyTemplate() {
        return /* html */ `
            <div class="ag-set-filter">
                <div ref="eFilterLoading" class="ag-filter-loading ag-hidden">${this.translateForSetFilter('loadingOoo')}</div>
                <ag-input-text-field class="ag-mini-filter" ref="eMiniFilter"></ag-input-text-field>
                <div ref="eFilterNoMatches" class="ag-filter-no-matches ag-hidden">${this.translateForSetFilter('noMatches')}</div>
                <div ref="eSetFilterList" class="ag-set-filter-list" role="presentation"></div>
            </div>`;
    }
    handleKeyDown(e) {
        super.handleKeyDown(e);
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
    }
    handleKeySpace(e) {
        const eDocument = this.gridOptionsWrapper.getDocument();
        if (!this.eSetFilterList.contains(eDocument.activeElement) || !this.virtualList) {
            return;
        }
        const currentItem = this.virtualList.getLastFocusedRow();
        if (currentItem == null) {
            return;
        }
        const component = this.virtualList.getComponentAt(currentItem);
        if (component == null) {
            return;
        }
        e.preventDefault();
        const { readOnly } = this.setFilterParams || {};
        if (!!readOnly) {
            return;
        }
        component.toggleSelected();
    }
    handleKeyEnter(e) {
        if (!this.setFilterParams) {
            return;
        }
        const { excelMode, readOnly } = this.setFilterParams || {};
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
    }
    getCssIdentifier() {
        return 'set-filter';
    }
    setModelAndRefresh(values) {
        return this.valueModel ? this.valueModel.setModel(values).then(() => this.refresh()) : core_1.AgPromise.resolve();
    }
    resetUiToDefaults() {
        this.setMiniFilter(null);
        return this.setModelAndRefresh(null);
    }
    setModelIntoUi(model) {
        this.setMiniFilter(null);
        const values = model == null ? null : model.values;
        return this.setModelAndRefresh(values);
    }
    getModelFromUi() {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const values = this.valueModel.getModel();
        if (!values) {
            return null;
        }
        return { values, filterType: this.getFilterType() };
    }
    getFilterType() {
        return 'set';
    }
    getValueModel() {
        return this.valueModel;
    }
    areModelsEqual(a, b) {
        // both are missing
        if (a == null && b == null) {
            return true;
        }
        return a != null && b != null && core_1._.areEqual(a.values, b.values);
    }
    setParams(params) {
        this.applyExcelModeOptions(params);
        super.setParams(params);
        this.setFilterParams = params;
        this.caseSensitive = params.caseSensitive || false;
        this.valueModel = new setValueModel_1.SetValueModel(params, loading => this.showOrHideLoadingScreen(loading), this.valueFormatterService, key => this.translateForSetFilter(key), v => this.caseFormat(v));
        this.initialiseFilterBodyUi();
        this.addEventListenersForDataChanges();
    }
    applyExcelModeOptions(params) {
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
    }
    addEventListenersForDataChanges() {
        if (!this.isValuesTakenFromGrid()) {
            return;
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_CELL_VALUE_CHANGED, (event) => {
            // only interested in changes to do with this column
            if (this.setFilterParams && event.column === this.setFilterParams.column) {
                this.syncAfterDataChange();
            }
        });
    }
    syncAfterDataChange() {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        let promise = this.valueModel.refreshValues();
        return promise.then(() => {
            this.refresh();
            this.onBtApply(false, true);
        });
    }
    showOrHideLoadingScreen(isLoading) {
        core_1._.setDisplayed(this.eFilterLoading, isLoading);
    }
    initialiseFilterBodyUi() {
        this.initVirtualList();
        this.initMiniFilter();
    }
    initVirtualList() {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const filterListName = translate('ariaFilterList', 'Filter List');
        const virtualList = this.virtualList = this.createBean(new core_1.VirtualList('filter', 'listbox', filterListName));
        const eSetFilterList = this.getRefElement('eSetFilterList');
        if (eSetFilterList) {
            eSetFilterList.appendChild(virtualList.getGui());
        }
        const { cellHeight } = this.setFilterParams;
        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }
        virtualList.setComponentCreator(value => this.createSetListItem(value));
        let model;
        if (this.setFilterParams.suppressSelectAll) {
            model = new ModelWrapper(this.valueModel);
        }
        else {
            model = new ModelWrapperWithSelectAll(this.valueModel, () => this.isSelectAllSelected());
        }
        virtualList.setModel(model);
    }
    getSelectAllLabel() {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const key = this.valueModel.getMiniFilter() == null || !this.setFilterParams.excelMode ?
            'selectAll' : 'selectAllSearchResults';
        return this.translateForSetFilter(key);
    }
    createSetListItem(value) {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        let listItem;
        if (value === SetFilter.SELECT_ALL_VALUE) {
            listItem = this.createBean(new setFilterListItem_1.SetFilterListItem(() => this.getSelectAllLabel(), this.setFilterParams, key => this.translateForSetFilter(key), this.isSelectAllSelected()));
            listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_SELECTION_CHANGED, (e) => this.onSelectAll(e.isSelected));
            return listItem;
        }
        listItem = this.createBean(new setFilterListItem_1.SetFilterListItem(value, this.setFilterParams, key => this.translateForSetFilter(key), this.valueModel.isValueSelected(value)));
        listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_SELECTION_CHANGED, (e) => this.onItemSelected(value, e.isSelected));
        return listItem;
    }
    initMiniFilter() {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const { eMiniFilter, gridOptionsWrapper } = this;
        const translate = gridOptionsWrapper.getLocaleTextFunc();
        eMiniFilter.setDisplayed(!this.setFilterParams.suppressMiniFilter);
        eMiniFilter.setValue(this.valueModel.getMiniFilter());
        eMiniFilter.onValueChange(() => this.onMiniFilterInput());
        eMiniFilter.setInputAriaLabel(translate('ariaSearchFilterValues', 'Search filter values'));
        this.addManagedListener(eMiniFilter.getInputElement(), 'keypress', e => this.onMiniFilterKeyPress(e));
    }
    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    afterGuiAttached(params) {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        super.afterGuiAttached(params);
        if (this.setFilterParams.excelMode) {
            this.resetUiToActiveModel();
            this.showOrHideResults();
        }
        this.refreshVirtualList();
        const { eMiniFilter } = this;
        eMiniFilter.setInputPlaceholder(this.translateForSetFilter('searchOoo'));
        if (!params || !params.suppressFocus) {
            eMiniFilter.getFocusableElement().focus();
        }
        const resizable = !!(params && params.container === 'floatingFilter');
        let resizableObject;
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
    }
    applyModel() {
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
        const result = super.applyModel();
        // keep appliedModelValues in sync with the applied model
        const appliedModel = this.getModel();
        if (appliedModel) {
            this.appliedModelValues = appliedModel.values.reduce((values, value) => {
                values[this.caseFormat(String(value))] = true;
                return values;
            }, {});
        }
        else {
            this.appliedModelValues = null;
        }
        return result;
    }
    isModelValid(model) {
        return this.setFilterParams && this.setFilterParams.excelMode ? model == null || model.values.length > 0 : true;
    }
    doesFilterPass(params) {
        if (!this.setFilterParams || !this.valueModel || !this.appliedModelValues) {
            return true;
        }
        const { node, data } = params;
        const { valueGetter, colDef: { keyCreator }, api, colDef, column, columnApi, context } = this.setFilterParams;
        let value = valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: data,
            getValue: (field) => data[field],
            node: node,
        });
        if (keyCreator) {
            const keyParams = {
                value,
                colDef,
                column,
                node,
                data,
                api,
                columnApi,
                context,
            };
            value = keyCreator(keyParams);
        }
        value = core_1._.makeNull(value);
        if (Array.isArray(value)) {
            return value.some(v => this.appliedModelValues[this.caseFormat(String(core_1._.makeNull(v)))] === true);
        }
        // Comparing against a value performs better than just checking for undefined
        // https://jsbench.me/hdk91jbw1h/
        return this.appliedModelValues[this.caseFormat(String(value))] === true;
    }
    onNewRowsLoaded() {
        if (!this.isValuesTakenFromGrid()) {
            return;
        }
        this.syncAfterDataChange();
    }
    isValuesTakenFromGrid() {
        if (!this.valueModel) {
            return false;
        }
        const valuesType = this.valueModel.getValuesType();
        return valuesType === setValueModel_1.SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param options The options to use.
     */
    setFilterValues(options) {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.valueModel.overrideValues(options).then(() => {
            this.refresh();
            this.onUiChanged();
        });
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started.
     */
    resetFilterValues() {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.valueModel.setValuesType(setValueModel_1.SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES);
        this.syncAfterDataChange();
    }
    refreshFilterValues() {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        // the model is still being initialised
        if (!this.valueModel.isInitialised()) {
            return;
        }
        this.valueModel.refreshValues().then(() => {
            this.refresh();
            this.onUiChanged();
        });
    }
    onAnyFilterChanged() {
        // don't block the current action when updating the values for this filter
        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            if (!this.valueModel) {
                throw new Error('Value model has not been created.');
            }
            this.valueModel.refreshAfterAnyFilterChanged().then(() => this.refresh());
        }, 0);
    }
    onMiniFilterInput() {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!this.valueModel.setMiniFilter(this.eMiniFilter.getValue())) {
            return;
        }
        const { applyMiniFilterWhileTyping, readOnly } = this.setFilterParams || {};
        if (!readOnly && applyMiniFilterWhileTyping) {
            this.filterOnAllVisibleValues(false);
        }
        else {
            this.updateUiAfterMiniFilterChange();
        }
    }
    updateUiAfterMiniFilterChange() {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const { excelMode, readOnly } = this.setFilterParams || {};
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
    }
    showOrHideResults() {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const hideResults = this.valueModel.getMiniFilter() != null && this.valueModel.getDisplayedValueCount() < 1;
        core_1._.setDisplayed(this.eNoMatches, hideResults);
        core_1._.setDisplayed(this.eSetFilterList, !hideResults);
    }
    resetUiToActiveModel() {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.eMiniFilter.setValue(null, true);
        this.valueModel.setMiniFilter(null);
        this.setModelIntoUi(this.getModel()).then(() => this.onUiChanged(false, 'prevent'));
    }
    onMiniFilterKeyPress(e) {
        const { excelMode, readOnly } = this.setFilterParams || {};
        if (e.key === core_1.KeyCode.ENTER && !excelMode && !readOnly) {
            this.filterOnAllVisibleValues();
        }
    }
    filterOnAllVisibleValues(applyImmediately = true) {
        const { readOnly } = this.setFilterParams || {};
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
    }
    focusRowIfAlive(rowIndex) {
        if (rowIndex == null) {
            return;
        }
        window.setTimeout(() => {
            if (!this.virtualList) {
                throw new Error('Virtual list has not been created.');
            }
            if (this.isAlive()) {
                this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    }
    onSelectAll(isSelected) {
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
        const focusedRow = this.virtualList.getLastFocusedRow();
        this.refresh();
        this.onUiChanged();
        this.focusRowIfAlive(focusedRow);
    }
    onItemSelected(value, isSelected) {
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
        const focusedRow = this.virtualList.getLastFocusedRow();
        this.refresh();
        this.onUiChanged();
        this.focusRowIfAlive(focusedRow);
    }
    setMiniFilter(newMiniFilter) {
        this.eMiniFilter.setValue(newMiniFilter);
        this.onMiniFilterInput();
    }
    getMiniFilter() {
        return this.valueModel ? this.valueModel.getMiniFilter() : null;
    }
    refresh() {
        if (!this.virtualList) {
            throw new Error('Virtual list has not been created.');
        }
        this.virtualList.refresh();
    }
    getValues() {
        return this.valueModel ? this.valueModel.getValues() : [];
    }
    refreshVirtualList() {
        if (this.setFilterParams && this.setFilterParams.refreshValuesOnOpen) {
            this.refreshFilterValues();
        }
        else {
            this.refresh();
        }
    }
    translateForSetFilter(key) {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(key, localeText_1.DEFAULT_LOCALE_TEXT[key]);
    }
    isSelectAllSelected() {
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
    }
    destroy() {
        if (this.virtualList != null) {
            this.virtualList.destroy();
            this.virtualList = null;
        }
        super.destroy();
    }
    caseFormat(valueToFormat) {
        if (valueToFormat == null || typeof valueToFormat !== 'string') {
            return valueToFormat;
        }
        return this.caseSensitive ? valueToFormat : valueToFormat.toUpperCase();
    }
}
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
exports.SetFilter = SetFilter;
class ModelWrapper {
    constructor(model) {
        this.model = model;
    }
    getRowCount() {
        return this.model.getDisplayedValueCount();
    }
    getRow(index) {
        return this.model.getDisplayedValue(index);
    }
    isRowSelected(index) {
        return this.model.isValueSelected(this.getRow(index));
    }
}
class ModelWrapperWithSelectAll {
    constructor(model, isSelectAllSelected) {
        this.model = model;
        this.isSelectAllSelected = isSelectAllSelected;
    }
    getRowCount() {
        return this.model.getDisplayedValueCount() + 1;
    }
    getRow(index) {
        return index === 0 ? SetFilter.SELECT_ALL_VALUE : this.model.getDisplayedValue(index - 1);
    }
    isRowSelected(index) {
        return index === 0 ? this.isSelectAllSelected() : this.model.isValueSelected(this.getRow(index));
    }
}
