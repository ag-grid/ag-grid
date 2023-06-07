var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Events, ProvidedFilter, RefSelector, VirtualList, AgPromise, KeyCode, _, GROUP_AUTO_COLUMN_ID, } from '@ag-grid-community/core';
import { SetFilterModelValuesType, SetValueModel } from './setValueModel';
import { SetFilterListItem } from './setFilterListItem';
import { DEFAULT_LOCALE_TEXT } from './localeText';
import { SetFilterDisplayValue } from './iSetDisplayValueModel';
import { SetFilterModelFormatter } from './setFilterModelFormatter';
/** @param V type of value in the Set Filter */
export class SetFilter extends ProvidedFilter {
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
        this.noValueFormatterSupplied = false;
        // To make the filtering super fast, we store the keys in an Set rather than using the default array
        this.appliedModelKeys = null;
        this.noAppliedModelKeys = false;
        this.filterModelFormatter = new SetFilterModelFormatter();
    }
    postConstruct() {
        super.postConstruct();
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
            case KeyCode.SPACE:
                this.handleKeySpace(e);
                break;
            case KeyCode.ENTER:
                this.handleKeyEnter(e);
                break;
            case KeyCode.LEFT:
                this.handleKeyLeft(e);
                break;
            case KeyCode.RIGHT:
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
            return AgPromise.resolve();
        }
        return super.setModel(model);
    }
    setModelAndRefresh(values) {
        return this.valueModel ? this.valueModel.setModel(values).then(() => this.refresh()) : AgPromise.resolve();
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
        return a != null && b != null && _.areEqual(a.values, b.values);
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
        const isGroupCol = params.column.getId().startsWith(GROUP_AUTO_COLUMN_ID);
        this.treeDataTreeList = this.gridOptionsService.is('treeData') && !!params.treeList && isGroupCol;
        this.getDataPath = this.gridOptionsService.get('getDataPath');
        this.groupingTreeList = !!this.columnModel.getRowGroupColumns().length && !!params.treeList && isGroupCol;
        this.createKey = this.generateCreateKey(keyCreator, this.convertValuesToStrings, this.treeDataTreeList || this.groupingTreeList);
        this.valueModel = new SetValueModel({
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
            this.noValueFormatterSupplied = true;
            // ref data is handled by ValueFormatterService
            if (!isRefData) {
                valueFormatter = params => _.toStringOrNull(params.value);
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
                return _.makeNull(keyCreator(params));
            };
        }
        if (convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return value => Array.isArray(value) ? value : _.makeNull(_.toStringOrNull(value));
        }
        else {
            return value => _.makeNull(_.toStringOrNull(value));
        }
    }
    getFormattedValue(key) {
        var _a;
        let value = this.valueModel.getValue(key);
        if (this.noValueFormatterSupplied && (this.treeDataTreeList || this.groupingTreeList) && Array.isArray(value)) {
            // essentially get back the cell value
            value = _.last(value);
        }
        const formattedValue = this.valueFormatterService.formatValue(this.setFilterParams.column, null, value, this.valueFormatter, false);
        return (_a = (formattedValue == null ? _.toStringOrNull(value) : formattedValue)) !== null && _a !== void 0 ? _a : this.translateForSetFilter('blanks');
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
        if (params.excelMode && params.defaultToNothingSelected) {
            params.defaultToNothingSelected = false;
            _.doOnce(() => console.warn('AG Grid: The Set Filter Parameter "defaultToNothingSelected" value was ignored because it does not work when "excelMode" is used.'), 'setFilterExcelModeDefaultToNothingSelect');
        }
    }
    addEventListenersForDataChanges() {
        if (!this.isValuesTakenFromGrid()) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, (event) => {
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
        _.setDisplayed(this.eFilterLoading, isLoading);
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
        const virtualList = this.virtualList = this.createBean(new VirtualList('filter', isTree ? 'tree' : 'listbox', filterListName));
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
            if (item.key === SetFilterDisplayValue.SELECT_ALL) {
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
            if (item === SetFilterDisplayValue.SELECT_ALL) {
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
        const listItem = this.createBean(new SetFilterListItem(itemParams));
        listItem.addEventListener(SetFilterListItem.EVENT_SELECTION_CHANGED, selectedListener);
        if (expandedListener) {
            listItem.addEventListener(SetFilterListItem.EVENT_EXPANDED_CHANGED, expandedListener);
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
            if (item.key === SetFilterDisplayValue.SELECT_ALL) {
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
            if (item === SetFilterDisplayValue.SELECT_ALL) {
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
        this.addManagedListener(eMiniFilter.getInputElement(), 'keydown', e => this.onMiniFilterKeyDown(e));
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
    }
    afterGuiDetached() {
        var _a, _b;
        super.afterGuiDetached();
        // discard any unapplied UI state (reset to model)
        if ((_a = this.setFilterParams) === null || _a === void 0 ? void 0 : _a.excelMode) {
            this.resetMiniFilter();
        }
        const appliedModel = this.getModel();
        if (((_b = this.setFilterParams) === null || _b === void 0 ? void 0 : _b.excelMode) || !this.areModelsEqual(appliedModel, this.getModelFromUi())) {
            this.resetUiToActiveModel(appliedModel);
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
            dataPath = dataPath.map(treeKey => _.toStringOrNull(_.makeNull(treeKey)));
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
        return valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
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
        this.valueModel.setValuesType(SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES);
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
            this.resetUiToActiveModel(this.getModel());
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
        _.setDisplayed(this.eNoMatches, hideResults);
        _.setDisplayed(this.eSetFilterList, !hideResults);
    }
    resetMiniFilter() {
        var _a;
        this.eMiniFilter.setValue(null, true);
        (_a = this.valueModel) === null || _a === void 0 ? void 0 : _a.setMiniFilter(null);
    }
    resetUiToActiveModel(currentModel, afterUiUpdatedFunc) {
        // override the default behaviour as we don't always want to clear the mini filter
        this.setModelAndRefresh(currentModel == null ? null : currentModel.values).then(() => {
            this.onUiChanged(false, 'prevent');
            afterUiUpdatedFunc === null || afterUiUpdatedFunc === void 0 ? void 0 : afterUiUpdatedFunc();
        });
    }
    handleCancelEnd(e) {
        this.setMiniFilter(null);
        super.handleCancelEnd(e);
    }
    onMiniFilterKeyDown(e) {
        const { excelMode, readOnly } = this.setFilterParams || {};
        if (e.key === KeyCode.ENTER && !excelMode && !readOnly) {
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
        return translate(key, DEFAULT_LOCALE_TEXT[key]);
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
    getPositionableElement() {
        return this.eSetFilterList;
    }
}
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
__decorate([
    Autowired('columnModel')
], SetFilter.prototype, "columnModel", void 0);
__decorate([
    Autowired('valueService')
], SetFilter.prototype, "valueService", void 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0RmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NldEZpbHRlci9zZXRGaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUVILFNBQVMsRUFFVCxNQUFNLEVBR04sY0FBYyxFQUNkLFdBQVcsRUFFWCxXQUFXLEVBR1gsU0FBUyxFQUNULE9BQU8sRUFFUCxDQUFDLEVBUUQsb0JBQW9CLEdBRXZCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLHdCQUF3QixFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBMEcsTUFBTSxxQkFBcUIsQ0FBQztBQUNoSyxPQUFPLEVBQXdCLG1CQUFtQixFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxxQkFBcUIsRUFBMEIsTUFBTSx5QkFBeUIsQ0FBQztBQUN4RixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVwRSwrQ0FBK0M7QUFDL0MsTUFBTSxPQUFPLFNBQXNCLFNBQVEsY0FBaUM7SUE4QnhFO1FBQ0ksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBckJmLGVBQVUsR0FBNEIsSUFBSSxDQUFDO1FBQzNDLG9CQUFlLEdBQW1DLElBQUksQ0FBQztRQUN2RCxnQkFBVyxHQUF1QixJQUFJLENBQUM7UUFDdkMsa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFDL0IsMkJBQXNCLEdBQVksS0FBSyxDQUFDO1FBQ3hDLHFCQUFnQixHQUFHLEtBQUssQ0FBQztRQUV6QixxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDekIsMkJBQXNCLEdBQUcsS0FBSyxDQUFDO1FBQy9CLDZCQUF3QixHQUFHLEtBQUssQ0FBQztRQUV6QyxvR0FBb0c7UUFDNUYscUJBQWdCLEdBQThCLElBQUksQ0FBQztRQUNuRCx1QkFBa0IsR0FBWSxLQUFLLENBQUM7UUFL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