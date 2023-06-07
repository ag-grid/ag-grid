var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { Autowired, Events, ProvidedFilter, RefSelector, VirtualList, AgPromise, KeyCode, _, GROUP_AUTO_COLUMN_ID, } from '@ag-grid-community/core';
import { SetFilterModelValuesType, SetValueModel } from './setValueModel';
import { SetFilterListItem } from './setFilterListItem';
import { DEFAULT_LOCALE_TEXT } from './localeText';
import { SetFilterDisplayValue } from './iSetDisplayValueModel';
import { SetFilterModelFormatter } from './setFilterModelFormatter';
/** @param V type of value in the Set Filter */
var SetFilter = /** @class */ (function (_super) {
    __extends(SetFilter, _super);
    function SetFilter() {
        var _this = _super.call(this, 'setFilter') || this;
        _this.valueModel = null;
        _this.setFilterParams = null;
        _this.virtualList = null;
        _this.caseSensitive = false;
        _this.convertValuesToStrings = false;
        _this.treeDataTreeList = false;
        _this.groupingTreeList = false;
        _this.hardRefreshVirtualList = false;
        _this.noValueFormatterSupplied = false;
        // To make the filtering super fast, we store the keys in an Set rather than using the default array
        _this.appliedModelKeys = null;
        _this.noAppliedModelKeys = false;
        _this.filterModelFormatter = new SetFilterModelFormatter();
        return _this;
    }
    SetFilter.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
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
    };
    SetFilter.prototype.handleKeySpace = function (e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.toggleSelected();
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
    SetFilter.prototype.handleKeyLeft = function (e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.setExpanded(false);
    };
    SetFilter.prototype.handleKeyRight = function (e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.setExpanded(true);
    };
    SetFilter.prototype.getComponentForKeyEvent = function (e) {
        var _a;
        var eDocument = this.gridOptionsService.getDocument();
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
        var readOnly = ((_a = this.setFilterParams) !== null && _a !== void 0 ? _a : {}).readOnly;
        if (!!readOnly) {
            return;
        }
        return component;
    };
    SetFilter.prototype.getCssIdentifier = function () {
        return 'set-filter';
    };
    SetFilter.prototype.setModel = function (model) {
        var _a;
        if (model == null && ((_a = this.valueModel) === null || _a === void 0 ? void 0 : _a.getModel()) == null) {
            // refreshing is expensive. if new and old model are both null (e.g. nothing set), skip.
            // mini filter isn't contained within the model, so always reset
            this.setMiniFilter(null);
            return AgPromise.resolve();
        }
        return _super.prototype.setModel.call(this, model);
    };
    SetFilter.prototype.setModelAndRefresh = function (values) {
        var _this = this;
        return this.valueModel ? this.valueModel.setModel(values).then(function () { return _this.refresh(); }) : AgPromise.resolve();
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
        return a != null && b != null && _.areEqual(a.values, b.values);
    };
    SetFilter.prototype.setParams = function (params) {
        var _this = this;
        var _a;
        this.applyExcelModeOptions(params);
        _super.prototype.setParams.call(this, params);
        this.setFilterParams = params;
        this.convertValuesToStrings = !!params.convertValuesToStrings;
        this.caseSensitive = !!params.caseSensitive;
        var keyCreator = (_a = params.keyCreator) !== null && _a !== void 0 ? _a : params.colDef.keyCreator;
        this.setValueFormatter(params.valueFormatter, keyCreator, this.convertValuesToStrings, !!params.treeList, !!params.colDef.refData);
        var isGroupCol = params.column.getId().startsWith(GROUP_AUTO_COLUMN_ID);
        this.treeDataTreeList = this.gridOptionsService.is('treeData') && !!params.treeList && isGroupCol;
        this.getDataPath = this.gridOptionsService.get('getDataPath');
        this.groupingTreeList = !!this.columnModel.getRowGroupColumns().length && !!params.treeList && isGroupCol;
        this.createKey = this.generateCreateKey(keyCreator, this.convertValuesToStrings, this.treeDataTreeList || this.groupingTreeList);
        this.valueModel = new SetValueModel({
            filterParams: params,
            setIsLoading: function (loading) { return _this.setIsLoading(loading); },
            valueFormatterService: this.valueFormatterService,
            translate: function (key) { return _this.translateForSetFilter(key); },
            caseFormat: function (v) { return _this.caseFormat(v); },
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
    };
    SetFilter.prototype.setValueFormatter = function (providedValueFormatter, keyCreator, convertValuesToStrings, treeList, isRefData) {
        var valueFormatter = providedValueFormatter;
        if (!valueFormatter) {
            if (keyCreator && !convertValuesToStrings && !treeList) {
                throw new Error('AG Grid: Must supply a Value Formatter in Set Filter params when using a Key Creator unless convertValuesToStrings is enabled');
            }
            this.noValueFormatterSupplied = true;
            // ref data is handled by ValueFormatterService
            if (!isRefData) {
                valueFormatter = function (params) { return _.toStringOrNull(params.value); };
            }
        }
        this.valueFormatter = valueFormatter;
    };
    SetFilter.prototype.generateCreateKey = function (keyCreator, convertValuesToStrings, treeDataOrGrouping) {
        var _this = this;
        if (treeDataOrGrouping && !keyCreator) {
            throw new Error('AG Grid: Must supply a Key Creator in Set Filter params when `treeList = true` on a group column, and Tree Data or Row Grouping is enabled.');
        }
        if (keyCreator) {
            return function (value, node) {
                if (node === void 0) { node = null; }
                var params = _this.getKeyCreatorParams(value, node);
                return _.makeNull(keyCreator(params));
            };
        }
        if (convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return function (value) { return Array.isArray(value) ? value : _.makeNull(_.toStringOrNull(value)); };
        }
        else {
            return function (value) { return _.makeNull(_.toStringOrNull(value)); };
        }
    };
    SetFilter.prototype.getFormattedValue = function (key) {
        var _a;
        var value = this.valueModel.getValue(key);
        if (this.noValueFormatterSupplied && (this.treeDataTreeList || this.groupingTreeList) && Array.isArray(value)) {
            // essentially get back the cell value
            value = _.last(value);
        }
        var formattedValue = this.valueFormatterService.formatValue(this.setFilterParams.column, null, value, this.valueFormatter, false);
        return (_a = (formattedValue == null ? _.toStringOrNull(value) : formattedValue)) !== null && _a !== void 0 ? _a : this.translateForSetFilter('blanks');
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
        if (params.excelMode && params.defaultToNothingSelected) {
            params.defaultToNothingSelected = false;
            _.doOnce(function () { return console.warn('AG Grid: The Set Filter Parameter "defaultToNothingSelected" value was ignored because it does not work when "excelMode" is used.'); }, 'setFilterExcelModeDefaultToNothingSelect');
        }
    };
    SetFilter.prototype.addEventListenersForDataChanges = function () {
        var _this = this;
        if (!this.isValuesTakenFromGrid()) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, function (event) {
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
    SetFilter.prototype.setIsLoading = function (isLoading) {
        _.setDisplayed(this.eFilterLoading, isLoading);
        if (!isLoading) {
            // hard refresh when async data received
            this.hardRefreshVirtualList = true;
        }
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
        var translate = this.localeService.getLocaleTextFunc();
        var filterListName = translate('ariaFilterList', 'Filter List');
        var isTree = !!this.setFilterParams.treeList;
        var virtualList = this.virtualList = this.createBean(new VirtualList('filter', isTree ? 'tree' : 'listbox', filterListName));
        var eSetFilterList = this.getRefElement('eSetFilterList');
        if (isTree) {
            eSetFilterList.classList.add('ag-set-filter-tree-list');
        }
        if (eSetFilterList) {
            eSetFilterList.appendChild(virtualList.getGui());
        }
        var cellHeight = this.setFilterParams.cellHeight;
        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }
        var componentCreator = function (item, listItemElement) { return _this.createSetListItem(item, isTree, listItemElement); };
        virtualList.setComponentCreator(componentCreator);
        var componentUpdater = function (item, component) { return _this.updateSetListItem(item, component); };
        virtualList.setComponentUpdater(componentUpdater);
        var model;
        if (this.setFilterParams.suppressSelectAll) {
            model = new ModelWrapper(this.valueModel);
        }
        else {
            model = new ModelWrapperWithSelectAll(this.valueModel, function () { return _this.isSelectAllSelected(); });
        }
        if (isTree) {
            model = new TreeModelWrapper(model);
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
    SetFilter.prototype.createSetListItem = function (item, isTree, focusWrapper) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var groupsExist = this.valueModel.hasGroups();
        var value;
        var depth;
        var isGroup;
        var hasIndeterminateExpandState;
        var selectedListener;
        var expandedListener;
        if (this.isSetFilterModelTreeItem(item)) {
            depth = item.depth;
            if (item.key === SetFilterDisplayValue.SELECT_ALL) {
                // select all
                value = function () { return _this.getSelectAllLabel(); };
                isGroup = groupsExist;
                hasIndeterminateExpandState = true;
                selectedListener = function (e) { return _this.onSelectAll(e.isSelected); };
                expandedListener = function (e) { return _this.onExpandAll(e.item, e.isExpanded); };
            }
            else if (item.children) {
                // group
                value = (_c = (_b = (_a = this.setFilterParams).treeListFormatter) === null || _b === void 0 ? void 0 : _b.call(_a, item.treeKey, item.depth, item.parentTreeKeys)) !== null && _c !== void 0 ? _c : item.treeKey;
                isGroup = true;
                selectedListener = function (e) { return _this.onGroupItemSelected(e.item, e.isSelected); };
                expandedListener = function (e) { return _this.onExpandedChanged(e.item, e.isExpanded); };
            }
            else {
                // leaf
                value = (_f = (_e = (_d = this.setFilterParams).treeListFormatter) === null || _e === void 0 ? void 0 : _e.call(_d, item.treeKey, item.depth, item.parentTreeKeys)) !== null && _f !== void 0 ? _f : item.treeKey;
                selectedListener = function (e) { return _this.onItemSelected(e.item.key, e.isSelected); };
            }
        }
        else {
            if (item === SetFilterDisplayValue.SELECT_ALL) {
                value = function () { return _this.getSelectAllLabel(); };
                selectedListener = function (e) { return _this.onSelectAll(e.isSelected); };
            }
            else {
                value = this.valueModel.getValue(item);
                selectedListener = function (e) { return _this.onItemSelected(e.item, e.isSelected); };
            }
        }
        var _g = this.isSelectedExpanded(item), isSelected = _g.isSelected, isExpanded = _g.isExpanded;
        var itemParams = {
            focusWrapper: focusWrapper,
            value: value,
            params: this.setFilterParams,
            translate: function (translateKey) { return _this.translateForSetFilter(translateKey); },
            valueFormatter: this.valueFormatter,
            item: item,
            isSelected: isSelected,
            isTree: isTree,
            depth: depth,
            groupsExist: groupsExist,
            isGroup: isGroup,
            isExpanded: isExpanded,
            hasIndeterminateExpandState: hasIndeterminateExpandState,
        };
        var listItem = this.createBean(new SetFilterListItem(itemParams));
        listItem.addEventListener(SetFilterListItem.EVENT_SELECTION_CHANGED, selectedListener);
        if (expandedListener) {
            listItem.addEventListener(SetFilterListItem.EVENT_EXPANDED_CHANGED, expandedListener);
        }
        return listItem;
    };
    SetFilter.prototype.updateSetListItem = function (item, component) {
        var _a = this.isSelectedExpanded(item), isSelected = _a.isSelected, isExpanded = _a.isExpanded;
        component.refresh(item, isSelected, isExpanded);
    };
    SetFilter.prototype.isSelectedExpanded = function (item) {
        var isSelected;
        var isExpanded;
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
        return { isSelected: isSelected, isExpanded: isExpanded };
    };
    SetFilter.prototype.isSetFilterModelTreeItem = function (item) {
        return (item === null || item === void 0 ? void 0 : item.treeKey) !== undefined;
    };
    SetFilter.prototype.initMiniFilter = function () {
        var _this = this;
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var _a = this, eMiniFilter = _a.eMiniFilter, localeService = _a.localeService;
        var translate = localeService.getLocaleTextFunc();
        eMiniFilter.setDisplayed(!this.setFilterParams.suppressMiniFilter);
        eMiniFilter.setValue(this.valueModel.getMiniFilter());
        eMiniFilter.onValueChange(function () { return _this.onMiniFilterInput(); });
        eMiniFilter.setInputAriaLabel(translate('ariaSearchFilterValues', 'Search filter values'));
        this.addManagedListener(eMiniFilter.getInputElement(), 'keydown', function (e) { return _this.onMiniFilterKeyDown(e); });
    };
    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    SetFilter.prototype.afterGuiAttached = function (params) {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        _super.prototype.afterGuiAttached.call(this, params);
        // collapse all tree list items (if tree list)
        this.resetExpansion();
        this.refreshVirtualList();
        var eMiniFilter = this.eMiniFilter;
        eMiniFilter.setInputPlaceholder(this.translateForSetFilter('searchOoo'));
        if (!params || !params.suppressFocus) {
            eMiniFilter.getFocusableElement().focus();
        }
    };
    SetFilter.prototype.afterGuiDetached = function () {
        var _a, _b;
        _super.prototype.afterGuiDetached.call(this);
        // discard any unapplied UI state (reset to model)
        if ((_a = this.setFilterParams) === null || _a === void 0 ? void 0 : _a.excelMode) {
            this.resetMiniFilter();
        }
        var appliedModel = this.getModel();
        if (((_b = this.setFilterParams) === null || _b === void 0 ? void 0 : _b.excelMode) || !this.areModelsEqual(appliedModel, this.getModelFromUi())) {
            this.resetUiToActiveModel(appliedModel);
            this.showOrHideResults();
        }
    };
    SetFilter.prototype.applyModel = function (source) {
        var _this = this;
        if (source === void 0) { source = 'api'; }
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
        var result = _super.prototype.applyModel.call(this, source);
        // keep appliedModelKeys in sync with the applied model
        var appliedModel = this.getModel();
        if (appliedModel) {
            this.appliedModelKeys = new Set();
            appliedModel.values.forEach(function (key) {
                _this.appliedModelKeys.add(_this.caseFormat(key));
            });
        }
        else {
            this.appliedModelKeys = null;
        }
        this.noAppliedModelKeys = (appliedModel === null || appliedModel === void 0 ? void 0 : appliedModel.values.length) === 0;
        return result;
    };
    SetFilter.prototype.isModelValid = function (model) {
        return this.setFilterParams && this.setFilterParams.excelMode ? model == null || model.values.length > 0 : true;
    };
    SetFilter.prototype.doesFilterPass = function (params) {
        var _this = this;
        if (!this.setFilterParams || !this.valueModel || !this.appliedModelKeys) {
            return true;
        }
        // if nothing selected, don't need to check value
        if (this.noAppliedModelKeys) {
            return false;
        }
        var node = params.node, data = params.data;
        if (this.treeDataTreeList) {
            return this.doesFilterPassForTreeData(node, data);
        }
        if (this.groupingTreeList) {
            return this.doesFilterPassForGrouping(node, data);
        }
        var value = this.getValueFromNode(node, data);
        if (this.convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return this.doesFilterPassForConvertValuesToString(node, value);
        }
        if (value != null && Array.isArray(value)) {
            if (value.length === 0) {
                return this.appliedModelKeys.has(null);
            }
            return value.some(function (v) { return _this.isInAppliedModel(_this.createKey(v, node)); });
        }
        return this.isInAppliedModel(this.createKey(value, node));
    };
    SetFilter.prototype.doesFilterPassForConvertValuesToString = function (node, value) {
        var _this = this;
        var key = this.createKey(value, node);
        if (key != null && Array.isArray(key)) {
            if (key.length === 0) {
                return this.appliedModelKeys.has(null);
            }
            return key.some(function (v) { return _this.isInAppliedModel(v); });
        }
        return this.isInAppliedModel(key);
    };
    SetFilter.prototype.doesFilterPassForTreeData = function (node, data) {
        var _a;
        if ((_a = node.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length) {
            // only perform checking on leaves. The core filtering logic for tree data won't work properly otherwise
            return false;
        }
        return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(this.getDataPath(data))));
    };
    SetFilter.prototype.doesFilterPassForGrouping = function (node, data) {
        var _this = this;
        var dataPath = this.columnModel.getRowGroupColumns().map(function (groupCol) { return _this.valueService.getKeyForNode(groupCol, node); });
        dataPath.push(this.getValueFromNode(node, data));
        return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(dataPath)));
    };
    SetFilter.prototype.checkMakeNullDataPath = function (dataPath) {
        if (dataPath) {
            dataPath = dataPath.map(function (treeKey) { return _.toStringOrNull(_.makeNull(treeKey)); });
        }
        if (dataPath === null || dataPath === void 0 ? void 0 : dataPath.some(function (treeKey) { return treeKey == null; })) {
            return null;
        }
        return dataPath;
    };
    SetFilter.prototype.isInAppliedModel = function (key) {
        return this.appliedModelKeys.has(this.caseFormat(key));
    };
    SetFilter.prototype.getValueFromNode = function (node, data) {
        var _a = this.setFilterParams, valueGetter = _a.valueGetter, api = _a.api, colDef = _a.colDef, column = _a.column, columnApi = _a.columnApi, context = _a.context;
        return valueGetter({
            api: api,
            colDef: colDef,
            column: column,
            columnApi: columnApi,
            context: context,
            data: data,
            getValue: function (field) { return data[field]; },
            node: node,
        });
    };
    SetFilter.prototype.getKeyCreatorParams = function (value, node) {
        if (node === void 0) { node = null; }
        return {
            value: value,
            colDef: this.setFilterParams.colDef,
            column: this.setFilterParams.column,
            node: node,
            data: node === null || node === void 0 ? void 0 : node.data,
            api: this.setFilterParams.api,
            columnApi: this.setFilterParams.columnApi,
            context: this.setFilterParams.context
        };
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
        return valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param values The values to use.
     */
    SetFilter.prototype.setFilterValues = function (values) {
        var _this = this;
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.valueModel.overrideValues(values).then(function () {
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
        this.valueModel.setValuesType(SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES);
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
            _this.valueModel.refreshAfterAnyFilterChanged().then(function (refresh) {
                if (refresh) {
                    _this.refresh();
                    _this.showOrHideResults();
                }
            });
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
            this.resetUiToActiveModel(this.getModel());
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
        _.setDisplayed(this.eNoMatches, hideResults);
        _.setDisplayed(this.eSetFilterList, !hideResults);
    };
    SetFilter.prototype.resetMiniFilter = function () {
        var _a;
        this.eMiniFilter.setValue(null, true);
        (_a = this.valueModel) === null || _a === void 0 ? void 0 : _a.setMiniFilter(null);
    };
    SetFilter.prototype.resetUiToActiveModel = function (currentModel, afterUiUpdatedFunc) {
        var _this = this;
        // override the default behaviour as we don't always want to clear the mini filter
        this.setModelAndRefresh(currentModel == null ? null : currentModel.values).then(function () {
            _this.onUiChanged(false, 'prevent');
            afterUiUpdatedFunc === null || afterUiUpdatedFunc === void 0 ? void 0 : afterUiUpdatedFunc();
        });
    };
    SetFilter.prototype.handleCancelEnd = function (e) {
        this.setMiniFilter(null);
        _super.prototype.handleCancelEnd.call(this, e);
    };
    SetFilter.prototype.onMiniFilterKeyDown = function (e) {
        var _a = this.setFilterParams || {}, excelMode = _a.excelMode, readOnly = _a.readOnly;
        if (e.key === KeyCode.ENTER && !excelMode && !readOnly) {
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
        this.refreshAfterSelection();
    };
    SetFilter.prototype.onGroupItemSelected = function (item, isSelected) {
        var _this = this;
        var recursiveGroupSelection = function (i) {
            if (i.children) {
                i.children.forEach(function (childItem) { return recursiveGroupSelection(childItem); });
            }
            else {
                _this.selectItem(i.key, isSelected);
            }
        };
        recursiveGroupSelection(item);
        this.refreshAfterSelection();
    };
    SetFilter.prototype.onItemSelected = function (key, isSelected) {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!this.virtualList) {
            throw new Error('Virtual list has not been created.');
        }
        this.selectItem(key, isSelected);
        this.refreshAfterSelection();
    };
    SetFilter.prototype.selectItem = function (key, isSelected) {
        if (isSelected) {
            this.valueModel.selectKey(key);
        }
        else {
            this.valueModel.deselectKey(key);
        }
    };
    SetFilter.prototype.onExpandAll = function (item, isExpanded) {
        var recursiveExpansion = function (i) {
            if (i.filterPasses && i.available && i.children) {
                i.children.forEach(function (childItem) { return recursiveExpansion(childItem); });
                i.expanded = isExpanded;
            }
        };
        recursiveExpansion(item);
        this.refreshAfterExpansion();
    };
    SetFilter.prototype.onExpandedChanged = function (item, isExpanded) {
        item.expanded = isExpanded;
        this.refreshAfterExpansion();
    };
    SetFilter.prototype.refreshAfterExpansion = function () {
        var focusedRow = this.virtualList.getLastFocusedRow();
        this.valueModel.updateDisplayedValues('expansion');
        this.refresh();
        this.focusRowIfAlive(focusedRow);
    };
    SetFilter.prototype.refreshAfterSelection = function () {
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
        this.virtualList.refresh(!this.hardRefreshVirtualList);
        if (this.hardRefreshVirtualList) {
            this.hardRefreshVirtualList = false;
        }
    };
    SetFilter.prototype.getFilterKeys = function () {
        return this.valueModel ? this.valueModel.getKeys() : [];
    };
    SetFilter.prototype.getFilterValues = function () {
        return this.valueModel ? this.valueModel.getValues() : [];
    };
    SetFilter.prototype.getValues = function () {
        return this.getFilterKeys();
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
        var translate = this.localeService.getLocaleTextFunc();
        return translate(key, DEFAULT_LOCALE_TEXT[key]);
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
    SetFilter.prototype.areAllChildrenSelected = function (item) {
        var _this = this;
        var recursiveChildSelectionCheck = function (i) {
            if (i.children) {
                var someTrue_1 = false;
                var someFalse_1 = false;
                var mixed = i.children.some(function (child) {
                    if (!child.filterPasses || !child.available) {
                        return false;
                    }
                    var childSelected = recursiveChildSelectionCheck(child);
                    if (childSelected === undefined) {
                        return true;
                    }
                    if (childSelected) {
                        someTrue_1 = true;
                    }
                    else {
                        someFalse_1 = true;
                    }
                    return someTrue_1 && someFalse_1;
                });
                // returning `undefined` means the checkbox status is indeterminate.
                // if not mixed and some true, all must be true
                return mixed ? undefined : someTrue_1;
            }
            else {
                return _this.valueModel.isKeySelected(i.key);
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
    SetFilter.prototype.resetExpansion = function () {
        var _a, _b;
        if (!((_a = this.setFilterParams) === null || _a === void 0 ? void 0 : _a.treeList)) {
            return;
        }
        var selectAllItem = (_b = this.valueModel) === null || _b === void 0 ? void 0 : _b.getSelectAllItem();
        if (this.isSetFilterModelTreeItem(selectAllItem)) {
            var recursiveCollapse_1 = function (i) {
                if (i.children) {
                    i.children.forEach(function (childItem) { return recursiveCollapse_1(childItem); });
                    i.expanded = false;
                }
            };
            recursiveCollapse_1(selectAllItem);
            this.valueModel.updateDisplayedValues('expansion');
        }
    };
    SetFilter.prototype.getModelAsString = function (model) {
        return this.filterModelFormatter.getModelAsString(model, this);
    };
    SetFilter.prototype.getPositionableElement = function () {
        return this.eSetFilterList;
    };
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
        return this.model.getDisplayedItem(index);
    };
    ModelWrapper.prototype.isRowSelected = function (index) {
        return this.model.isKeySelected(this.getRow(index));
    };
    ModelWrapper.prototype.areRowsEqual = function (oldRow, newRow) {
        return oldRow === newRow;
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
        return index === 0 ? this.model.getSelectAllItem() : this.model.getDisplayedItem(index - 1);
    };
    ModelWrapperWithSelectAll.prototype.isRowSelected = function (index) {
        return index === 0 ? this.isSelectAllSelected() : this.model.isKeySelected(this.getRow(index));
    };
    ModelWrapperWithSelectAll.prototype.areRowsEqual = function (oldRow, newRow) {
        return oldRow === newRow;
    };
    return ModelWrapperWithSelectAll;
}());
// isRowSelected is used by VirtualList to add aria tags for flat lists. We want to suppress this when using trees
var TreeModelWrapper = /** @class */ (function () {
    function TreeModelWrapper(model) {
        this.model = model;
    }
    TreeModelWrapper.prototype.getRowCount = function () {
        return this.model.getRowCount();
    };
    TreeModelWrapper.prototype.getRow = function (index) {
        return this.model.getRow(index);
    };
    TreeModelWrapper.prototype.areRowsEqual = function (oldRow, newRow) {
        if (oldRow == null && newRow == null) {
            return true;
        }
        return oldRow != null && newRow != null && oldRow.treeKey === newRow.treeKey && oldRow.depth === newRow.depth;
    };
    return TreeModelWrapper;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0RmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NldEZpbHRlci9zZXRGaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUVILFNBQVMsRUFFVCxNQUFNLEVBR04sY0FBYyxFQUNkLFdBQVcsRUFFWCxXQUFXLEVBR1gsU0FBUyxFQUNULE9BQU8sRUFFUCxDQUFDLEVBUUQsb0JBQW9CLEdBRXZCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLHdCQUF3QixFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBMEcsTUFBTSxxQkFBcUIsQ0FBQztBQUNoSyxPQUFPLEVBQXdCLG1CQUFtQixFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxxQkFBcUIsRUFBMEIsTUFBTSx5QkFBeUIsQ0FBQztBQUN4RixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVwRSwrQ0FBK0M7QUFDL0M7SUFBMkMsNkJBQWlDO0lBOEJ4RTtRQUFBLFlBQ0ksa0JBQU0sV0FBVyxDQUFDLFNBQ3JCO1FBdEJPLGdCQUFVLEdBQTRCLElBQUksQ0FBQztRQUMzQyxxQkFBZSxHQUFtQyxJQUFJLENBQUM7UUFDdkQsaUJBQVcsR0FBdUIsSUFBSSxDQUFDO1FBQ3ZDLG1CQUFhLEdBQVksS0FBSyxDQUFDO1FBQy9CLDRCQUFzQixHQUFZLEtBQUssQ0FBQztRQUN4QyxzQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFFekIsc0JBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLDRCQUFzQixHQUFHLEtBQUssQ0FBQztRQUMvQiw4QkFBd0IsR0FBRyxLQUFLLENBQUM7UUFFekMsb0dBQW9HO1FBQzVGLHNCQUFnQixHQUE4QixJQUFJLENBQUM7UUFDbkQsd0JBQWtCLEdBQVksS0FBSyxDQUFD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