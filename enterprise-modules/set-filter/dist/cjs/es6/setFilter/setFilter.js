"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetFilter = void 0;
const core_1 = require("@ag-grid-community/core");
const setValueModel_1 = require("./setValueModel");
const setFilterListItem_1 = require("./setFilterListItem");
const localeText_1 = require("./localeText");
const iSetDisplayValueModel_1 = require("./iSetDisplayValueModel");
const setFilterModelFormatter_1 = require("./setFilterModelFormatter");
/** @param V type of value in the Set Filter */
class SetFilter extends core_1.ProvidedFilter {
    constructor() {
        super('setFilter');
        this.valueModel = null;
        this.setFilterParams = null;
        this.virtualList = null;
        this.caseSensitive = false;
        this.convertValuesToStrings = false;
        this.treeDataTreeList = false;
        this.groupingTreeList = false;
        this.hardRefreshVirtualList = false;
        // To make the filtering super fast, we store the keys in an Set rather than using the default array
        this.appliedModelKeys = null;
        this.noAppliedModelKeys = false;
        this.filterModelFormatter = new setFilterModelFormatter_1.SetFilterModelFormatter();
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
            case core_1.KeyCode.LEFT:
                this.handleKeyLeft(e);
                break;
            case core_1.KeyCode.RIGHT:
                this.handleKeyRight(e);
                break;
        }
    }
    handleKeySpace(e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.toggleSelected();
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
    handleKeyLeft(e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.setExpanded(false);
    }
    handleKeyRight(e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.setExpanded(true);
    }
    getComponentForKeyEvent(e) {
        var _a;
        const eDocument = this.gridOptionsService.getDocument();
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
        const { readOnly } = (_a = this.setFilterParams) !== null && _a !== void 0 ? _a : {};
        if (!!readOnly) {
            return;
        }
        return component;
    }
    getCssIdentifier() {
        return 'set-filter';
    }
    setModel(model) {
        var _a;
        if (model == null && ((_a = this.valueModel) === null || _a === void 0 ? void 0 : _a.getModel()) == null) {
            // refreshing is expensive. if new and old model are both null (e.g. nothing set), skip.
            // mini filter isn't contained within the model, so always reset
            this.setMiniFilter(null);
            return core_1.AgPromise.resolve();
        }
        return super.setModel(model);
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
        var _a;
        this.applyExcelModeOptions(params);
        super.setParams(params);
        this.setFilterParams = params;
        this.convertValuesToStrings = !!params.convertValuesToStrings;
        this.caseSensitive = !!params.caseSensitive;
        let keyCreator = (_a = params.keyCreator) !== null && _a !== void 0 ? _a : params.colDef.keyCreator;
        this.setValueFormatter(params.valueFormatter, keyCreator, this.convertValuesToStrings, !!params.treeList, !!params.colDef.refData);
        const isGroupCol = params.column.getId().startsWith(core_1.GROUP_AUTO_COLUMN_ID);
        this.treeDataTreeList = this.gridOptionsService.is('treeData') && !!params.treeList && isGroupCol;
        this.getDataPath = this.gridOptionsService.get('getDataPath');
        this.groupingTreeList = !!this.columnModel.getRowGroupColumns().length && !!params.treeList && isGroupCol;
        this.createKey = this.generateCreateKey(keyCreator, this.convertValuesToStrings, this.treeDataTreeList || this.groupingTreeList);
        this.valueModel = new setValueModel_1.SetValueModel({
            filterParams: params,
            setIsLoading: loading => this.setIsLoading(loading),
            valueFormatterService: this.valueFormatterService,
            translate: key => this.translateForSetFilter(key),
            caseFormat: v => this.caseFormat(v),
            createKey: this.createKey,
            valueFormatter: this.valueFormatter,
            usingComplexObjects: !!keyCreator,
            gridOptionsService: this.gridOptionsService,
            columnModel: this.columnModel,
            valueService: this.valueService,
            treeDataTreeList: this.treeDataTreeList,
            groupingTreeList: this.groupingTreeList
        });
        this.initialiseFilterBodyUi();
        this.addEventListenersForDataChanges();
    }
    setValueFormatter(providedValueFormatter, keyCreator, convertValuesToStrings, treeList, isRefData) {
        let valueFormatter = providedValueFormatter;
        if (!valueFormatter) {
            if (keyCreator && !convertValuesToStrings && !treeList) {
                throw new Error('AG Grid: Must supply a Value Formatter in Set Filter params when using a Key Creator unless convertValuesToStrings is enabled');
            }
            // ref data is handled by ValueFormatterService
            if (!isRefData) {
                valueFormatter = params => core_1._.toStringOrNull(params.value);
            }
        }
        this.valueFormatter = valueFormatter;
    }
    generateCreateKey(keyCreator, convertValuesToStrings, treeDataOrGrouping) {
        if (treeDataOrGrouping && !keyCreator) {
            throw new Error('AG Grid: Must supply a Key Creator in Set Filter params when `treeList = true` on a group column, and Tree Data or Row Grouping is enabled.');
        }
        if (keyCreator) {
            return (value, node = null) => {
                const params = this.getKeyCreatorParams(value, node);
                return core_1._.makeNull(keyCreator(params));
            };
        }
        if (convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return value => Array.isArray(value) ? value : core_1._.makeNull(core_1._.toStringOrNull(value));
        }
        else {
            return value => core_1._.makeNull(core_1._.toStringOrNull(value));
        }
    }
    getFormattedValue(key) {
        var _a;
        let value = this.valueModel.getValue(key);
        // essentially get back the cell value
        if ((this.treeDataTreeList || this.groupingTreeList) && Array.isArray(value)) {
            value = value[value.length - 1];
        }
        const formattedValue = this.valueFormatterService.formatValue(this.setFilterParams.column, null, value, this.valueFormatter, false);
        return (_a = (formattedValue == null ? core_1._.toStringOrNull(value) : formattedValue)) !== null && _a !== void 0 ? _a : this.translateForSetFilter('blanks');
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
    setIsLoading(isLoading) {
        core_1._.setDisplayed(this.eFilterLoading, isLoading);
        if (!isLoading) {
            // hard refresh when async data received
            this.hardRefreshVirtualList = true;
        }
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
        const translate = this.localeService.getLocaleTextFunc();
        const filterListName = translate('ariaFilterList', 'Filter List');
        const isTree = !!this.setFilterParams.treeList;
        const virtualList = this.virtualList = this.createBean(new core_1.VirtualList('filter', isTree ? 'tree' : 'listbox', filterListName));
        const eSetFilterList = this.getRefElement('eSetFilterList');
        if (isTree) {
            eSetFilterList.classList.add('ag-set-filter-tree-list');
        }
        if (eSetFilterList) {
            eSetFilterList.appendChild(virtualList.getGui());
        }
        const { cellHeight } = this.setFilterParams;
        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }
        const componentCreator = (item, listItemElement) => this.createSetListItem(item, isTree, listItemElement);
        virtualList.setComponentCreator(componentCreator);
        const componentUpdater = (item, component) => this.updateSetListItem(item, component);
        virtualList.setComponentUpdater(componentUpdater);
        let model;
        if (this.setFilterParams.suppressSelectAll) {
            model = new ModelWrapper(this.valueModel);
        }
        else {
            model = new ModelWrapperWithSelectAll(this.valueModel, () => this.isSelectAllSelected());
        }
        if (isTree) {
            model = new TreeModelWrapper(model);
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
    createSetListItem(item, isTree, focusWrapper) {
        var _a, _b, _c, _d, _e, _f;
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const groupsExist = this.valueModel.hasGroups();
        let value;
        let depth;
        let isGroup;
        let hasIndeterminateExpandState;
        let selectedListener;
        let expandedListener;
        if (this.isSetFilterModelTreeItem(item)) {
            depth = item.depth;
            if (item.key === iSetDisplayValueModel_1.SetFilterDisplayValue.SELECT_ALL) {
                // select all
                value = () => this.getSelectAllLabel();
                isGroup = groupsExist;
                hasIndeterminateExpandState = true;
                selectedListener = (e) => this.onSelectAll(e.isSelected);
                expandedListener = (e) => this.onExpandAll(e.item, e.isExpanded);
            }
            else if (item.children) {
                // group
                value = (_c = (_b = (_a = this.setFilterParams).treeListFormatter) === null || _b === void 0 ? void 0 : _b.call(_a, item.treeKey, item.depth, item.parentTreeKeys)) !== null && _c !== void 0 ? _c : item.treeKey;
                isGroup = true;
                selectedListener = (e) => this.onGroupItemSelected(e.item, e.isSelected);
                expandedListener = (e) => this.onExpandedChanged(e.item, e.isExpanded);
            }
            else {
                // leaf
                value = (_f = (_e = (_d = this.setFilterParams).treeListFormatter) === null || _e === void 0 ? void 0 : _e.call(_d, item.treeKey, item.depth, item.parentTreeKeys)) !== null && _f !== void 0 ? _f : item.treeKey;
                selectedListener = (e) => this.onItemSelected(e.item.key, e.isSelected);
            }
        }
        else {
            if (item === iSetDisplayValueModel_1.SetFilterDisplayValue.SELECT_ALL) {
                value = () => this.getSelectAllLabel();
                selectedListener = (e) => this.onSelectAll(e.isSelected);
            }
            else {
                value = this.valueModel.getValue(item);
                selectedListener = (e) => this.onItemSelected(e.item, e.isSelected);
            }
        }
        const { isSelected, isExpanded } = this.isSelectedExpanded(item);
        const itemParams = {
            focusWrapper,
            value,
            params: this.setFilterParams,
            translate: (translateKey) => this.translateForSetFilter(translateKey),
            valueFormatter: this.valueFormatter,
            item,
            isSelected,
            isTree,
            depth,
            groupsExist,
            isGroup,
            isExpanded,
            hasIndeterminateExpandState,
        };
        const listItem = this.createBean(new setFilterListItem_1.SetFilterListItem(itemParams));
        listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_SELECTION_CHANGED, selectedListener);
        if (expandedListener) {
            listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_EXPANDED_CHANGED, expandedListener);
        }
        return listItem;
    }
    updateSetListItem(item, component) {
        const { isSelected, isExpanded } = this.isSelectedExpanded(item);
        component.refresh(item, isSelected, isExpanded);
    }
    isSelectedExpanded(item) {
        let isSelected;
        let isExpanded;
        if (this.isSetFilterModelTreeItem(item)) {
            isExpanded = item.expanded;
            if (item.key === iSetDisplayValueModel_1.SetFilterDisplayValue.SELECT_ALL) {
                isSelected = this.isSelectAllSelected();
            }
            else if (item.children) {
                isSelected = this.areAllChildrenSelected(item);
            }
            else {
                isSelected = this.valueModel.isKeySelected(item.key);
            }
        }
        else {
            if (item === iSetDisplayValueModel_1.SetFilterDisplayValue.SELECT_ALL) {
                isSelected = this.isSelectAllSelected();
            }
            else {
                isSelected = this.valueModel.isKeySelected(item);
            }
        }
        return { isSelected, isExpanded };
    }
    isSetFilterModelTreeItem(item) {
        return (item === null || item === void 0 ? void 0 : item.treeKey) !== undefined;
    }
    initMiniFilter() {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const { eMiniFilter, localeService } = this;
        const translate = localeService.getLocaleTextFunc();
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
        // collapse all tree list items (if tree list)
        this.resetExpansion();
        this.refreshVirtualList();
        const { eMiniFilter } = this;
        eMiniFilter.setInputPlaceholder(this.translateForSetFilter('searchOoo'));
        if (!params || !params.suppressFocus) {
            eMiniFilter.getFocusableElement().focus();
        }
        const resizable = !!(params && params.container === 'floatingFilter');
        let resizableObject;
        if (this.gridOptionsService.is('enableRtl')) {
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
    afterGuiDetached() {
        var _a;
        // discard any unapplied UI state (reset to model)
        if ((_a = this.setFilterParams) === null || _a === void 0 ? void 0 : _a.excelMode) {
            this.resetUiToActiveModel();
            this.showOrHideResults();
        }
    }
    applyModel(source = 'api') {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (this.setFilterParams.excelMode && source !== 'rowDataUpdated' && this.valueModel.isEverythingVisibleSelected()) {
            // In Excel, if the filter is applied with all visible values selected, then any active filter on the
            // column is removed. This ensures the filter is removed in this situation.
            this.valueModel.selectAllMatchingMiniFilter();
        }
        const result = super.applyModel(source);
        // keep appliedModelKeys in sync with the applied model
        const appliedModel = this.getModel();
        if (appliedModel) {
            this.appliedModelKeys = new Set();
            appliedModel.values.forEach(key => {
                this.appliedModelKeys.add(this.caseFormat(key));
            });
        }
        else {
            this.appliedModelKeys = null;
        }
        this.noAppliedModelKeys = (appliedModel === null || appliedModel === void 0 ? void 0 : appliedModel.values.length) === 0;
        return result;
    }
    isModelValid(model) {
        return this.setFilterParams && this.setFilterParams.excelMode ? model == null || model.values.length > 0 : true;
    }
    doesFilterPass(params) {
        if (!this.setFilterParams || !this.valueModel || !this.appliedModelKeys) {
            return true;
        }
        // if nothing selected, don't need to check value
        if (this.noAppliedModelKeys) {
            return false;
        }
        const { node, data } = params;
        if (this.treeDataTreeList) {
            return this.doesFilterPassForTreeData(node, data);
        }
        if (this.groupingTreeList) {
            return this.doesFilterPassForGrouping(node, data);
        }
        let value = this.getValueFromNode(node, data);
        if (this.convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return this.doesFilterPassForConvertValuesToString(node, value);
        }
        if (value != null && Array.isArray(value)) {
            if (value.length === 0) {
                return this.appliedModelKeys.has(null);
            }
            return value.some(v => this.isInAppliedModel(this.createKey(v, node)));
        }
        return this.isInAppliedModel(this.createKey(value, node));
    }
    doesFilterPassForConvertValuesToString(node, value) {
        const key = this.createKey(value, node);
        if (key != null && Array.isArray(key)) {
            if (key.length === 0) {
                return this.appliedModelKeys.has(null);
            }
            return key.some(v => this.isInAppliedModel(v));
        }
        return this.isInAppliedModel(key);
    }
    doesFilterPassForTreeData(node, data) {
        var _a;
        if ((_a = node.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length) {
            // only perform checking on leaves. The core filtering logic for tree data won't work properly otherwise
            return false;
        }
        return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(this.getDataPath(data))));
    }
    doesFilterPassForGrouping(node, data) {
        const dataPath = this.columnModel.getRowGroupColumns().map(groupCol => this.valueService.getKeyForNode(groupCol, node));
        dataPath.push(this.getValueFromNode(node, data));
        return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(dataPath)));
    }
    checkMakeNullDataPath(dataPath) {
        if (dataPath) {
            dataPath = dataPath.map(treeKey => core_1._.toStringOrNull(core_1._.makeNull(treeKey)));
        }
        if (dataPath === null || dataPath === void 0 ? void 0 : dataPath.some(treeKey => treeKey == null)) {
            return null;
        }
        return dataPath;
    }
    isInAppliedModel(key) {
        return this.appliedModelKeys.has(this.caseFormat(key));
    }
    getValueFromNode(node, data) {
        const { valueGetter, api, colDef, column, columnApi, context } = this.setFilterParams;
        return valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: data,
            getValue: (field) => data[field],
            node: node,
        });
    }
    getKeyCreatorParams(value, node = null) {
        return {
            value,
            colDef: this.setFilterParams.colDef,
            column: this.setFilterParams.column,
            node: node,
            data: node === null || node === void 0 ? void 0 : node.data,
            api: this.setFilterParams.api,
            columnApi: this.setFilterParams.columnApi,
            context: this.setFilterParams.context
        };
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
     * @param values The values to use.
     */
    setFilterValues(values) {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.valueModel.overrideValues(values).then(() => {
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
            this.valueModel.refreshAfterAnyFilterChanged().then(refresh => {
                if (refresh) {
                    this.refresh();
                    this.showOrHideResults();
                }
            });
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
        this.refreshAfterSelection();
    }
    onGroupItemSelected(item, isSelected) {
        const recursiveGroupSelection = (i) => {
            if (i.children) {
                i.children.forEach(childItem => recursiveGroupSelection(childItem));
            }
            else {
                this.selectItem(i.key, isSelected);
            }
        };
        recursiveGroupSelection(item);
        this.refreshAfterSelection();
    }
    onItemSelected(key, isSelected) {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!this.virtualList) {
            throw new Error('Virtual list has not been created.');
        }
        this.selectItem(key, isSelected);
        this.refreshAfterSelection();
    }
    selectItem(key, isSelected) {
        if (isSelected) {
            this.valueModel.selectKey(key);
        }
        else {
            this.valueModel.deselectKey(key);
        }
    }
    onExpandAll(item, isExpanded) {
        const recursiveExpansion = (i) => {
            if (i.filterPasses && i.available && i.children) {
                i.children.forEach(childItem => recursiveExpansion(childItem));
                i.expanded = isExpanded;
            }
        };
        recursiveExpansion(item);
        this.refreshAfterExpansion();
    }
    onExpandedChanged(item, isExpanded) {
        item.expanded = isExpanded;
        this.refreshAfterExpansion();
    }
    refreshAfterExpansion() {
        const focusedRow = this.virtualList.getLastFocusedRow();
        this.valueModel.updateDisplayedValues('expansion');
        this.refresh();
        this.focusRowIfAlive(focusedRow);
    }
    refreshAfterSelection() {
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
        this.virtualList.refresh(!this.hardRefreshVirtualList);
        if (this.hardRefreshVirtualList) {
            this.hardRefreshVirtualList = false;
        }
    }
    getFilterKeys() {
        return this.valueModel ? this.valueModel.getKeys() : [];
    }
    getFilterValues() {
        return this.valueModel ? this.valueModel.getValues() : [];
    }
    getValues() {
        return this.getFilterKeys();
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
        const translate = this.localeService.getLocaleTextFunc();
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
    areAllChildrenSelected(item) {
        const recursiveChildSelectionCheck = (i) => {
            if (i.children) {
                let someTrue = false;
                let someFalse = false;
                const mixed = i.children.some(child => {
                    if (!child.filterPasses || !child.available) {
                        return false;
                    }
                    const childSelected = recursiveChildSelectionCheck(child);
                    if (childSelected === undefined) {
                        return true;
                    }
                    if (childSelected) {
                        someTrue = true;
                    }
                    else {
                        someFalse = true;
                    }
                    return someTrue && someFalse;
                });
                // returning `undefined` means the checkbox status is indeterminate.
                // if not mixed and some true, all must be true
                return mixed ? undefined : someTrue;
            }
            else {
                return this.valueModel.isKeySelected(i.key);
            }
        };
        if (!this.setFilterParams.defaultToNothingSelected) {
            // everything selected by default
            return recursiveChildSelectionCheck(item);
        }
        else {
            // nothing selected by default
            return this.valueModel.hasSelections() && recursiveChildSelectionCheck(item);
        }
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
    resetExpansion() {
        var _a, _b;
        if (!((_a = this.setFilterParams) === null || _a === void 0 ? void 0 : _a.treeList)) {
            return;
        }
        const selectAllItem = (_b = this.valueModel) === null || _b === void 0 ? void 0 : _b.getSelectAllItem();
        if (this.isSetFilterModelTreeItem(selectAllItem)) {
            const recursiveCollapse = (i) => {
                if (i.children) {
                    i.children.forEach(childItem => recursiveCollapse(childItem));
                    i.expanded = false;
                }
            };
            recursiveCollapse(selectAllItem);
            this.valueModel.updateDisplayedValues('expansion');
        }
    }
    getModelAsString(model) {
        return this.filterModelFormatter.getModelAsString(model, this);
    }
}
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
__decorate([
    core_1.Autowired('columnModel')
], SetFilter.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('valueService')
], SetFilter.prototype, "valueService", void 0);
exports.SetFilter = SetFilter;
class ModelWrapper {
    constructor(model) {
        this.model = model;
    }
    getRowCount() {
        return this.model.getDisplayedValueCount();
    }
    getRow(index) {
        return this.model.getDisplayedItem(index);
    }
    isRowSelected(index) {
        return this.model.isKeySelected(this.getRow(index));
    }
    areRowsEqual(oldRow, newRow) {
        return oldRow === newRow;
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
        return index === 0 ? this.model.getSelectAllItem() : this.model.getDisplayedItem(index - 1);
    }
    isRowSelected(index) {
        return index === 0 ? this.isSelectAllSelected() : this.model.isKeySelected(this.getRow(index));
    }
    areRowsEqual(oldRow, newRow) {
        return oldRow === newRow;
    }
}
// isRowSelected is used by VirtualList to add aria tags for flat lists. We want to suppress this when using trees
class TreeModelWrapper {
    constructor(model) {
        this.model = model;
    }
    getRowCount() {
        return this.model.getRowCount();
    }
    getRow(index) {
        return this.model.getRow(index);
    }
    areRowsEqual(oldRow, newRow) {
        if (oldRow == null && newRow == null) {
            return true;
        }
        return oldRow != null && newRow != null && oldRow.treeKey === newRow.treeKey && oldRow.depth === newRow.depth;
    }
}
