"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.SetFilter = void 0;
var core_1 = require("@ag-grid-community/core");
var setValueModel_1 = require("./setValueModel");
var setFilterListItem_1 = require("./setFilterListItem");
var localeText_1 = require("./localeText");
var iSetDisplayValueModel_1 = require("./iSetDisplayValueModel");
var setFilterModelFormatter_1 = require("./setFilterModelFormatter");
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
        // To make the filtering super fast, we store the keys in an Set rather than using the default array
        _this.appliedModelKeys = null;
        _this.noAppliedModelKeys = false;
        _this.filterModelFormatter = new setFilterModelFormatter_1.SetFilterModelFormatter();
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
            case core_1.KeyCode.LEFT:
                this.handleKeyLeft(e);
                break;
            case core_1.KeyCode.RIGHT:
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
            return core_1.AgPromise.resolve();
        }
        return _super.prototype.setModel.call(this, model);
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
        var _a;
        this.applyExcelModeOptions(params);
        _super.prototype.setParams.call(this, params);
        this.setFilterParams = params;
        this.convertValuesToStrings = !!params.convertValuesToStrings;
        this.caseSensitive = !!params.caseSensitive;
        var keyCreator = (_a = params.keyCreator) !== null && _a !== void 0 ? _a : params.colDef.keyCreator;
        this.setValueFormatter(params.valueFormatter, keyCreator, this.convertValuesToStrings, !!params.treeList, !!params.colDef.refData);
        var isGroupCol = params.column.getId().startsWith(core_1.GROUP_AUTO_COLUMN_ID);
        this.treeDataTreeList = this.gridOptionsService.is('treeData') && !!params.treeList && isGroupCol;
        this.getDataPath = this.gridOptionsService.get('getDataPath');
        this.groupingTreeList = !!this.columnModel.getRowGroupColumns().length && !!params.treeList && isGroupCol;
        this.createKey = this.generateCreateKey(keyCreator, this.convertValuesToStrings, this.treeDataTreeList || this.groupingTreeList);
        this.valueModel = new setValueModel_1.SetValueModel({
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
            // ref data is handled by ValueFormatterService
            if (!isRefData) {
                valueFormatter = function (params) { return core_1._.toStringOrNull(params.value); };
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
                return core_1._.makeNull(keyCreator(params));
            };
        }
        if (convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return function (value) { return Array.isArray(value) ? value : core_1._.makeNull(core_1._.toStringOrNull(value)); };
        }
        else {
            return function (value) { return core_1._.makeNull(core_1._.toStringOrNull(value)); };
        }
    };
    SetFilter.prototype.getFormattedValue = function (key) {
        var _a;
        var value = this.valueModel.getValue(key);
        // essentially get back the cell value
        if ((this.treeDataTreeList || this.groupingTreeList) && Array.isArray(value)) {
            value = value[value.length - 1];
        }
        var formattedValue = this.valueFormatterService.formatValue(this.setFilterParams.column, null, value, this.valueFormatter, false);
        return (_a = (formattedValue == null ? core_1._.toStringOrNull(value) : formattedValue)) !== null && _a !== void 0 ? _a : this.translateForSetFilter('blanks');
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
    SetFilter.prototype.setIsLoading = function (isLoading) {
        core_1._.setDisplayed(this.eFilterLoading, isLoading);
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
        var virtualList = this.virtualList = this.createBean(new core_1.VirtualList('filter', isTree ? 'tree' : 'listbox', filterListName));
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
            if (item.key === iSetDisplayValueModel_1.SetFilterDisplayValue.SELECT_ALL) {
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
            if (item === iSetDisplayValueModel_1.SetFilterDisplayValue.SELECT_ALL) {
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
        var listItem = this.createBean(new setFilterListItem_1.SetFilterListItem(itemParams));
        listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_SELECTION_CHANGED, selectedListener);
        if (expandedListener) {
            listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_EXPANDED_CHANGED, expandedListener);
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
        this.addManagedListener(eMiniFilter.getInputElement(), 'keypress', function (e) { return _this.onMiniFilterKeyPress(e); });
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
        var resizable = !!(params && params.container === 'floatingFilter');
        var resizableObject;
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
    };
    SetFilter.prototype.afterGuiDetached = function () {
        var _a;
        // discard any unapplied UI state (reset to model)
        if ((_a = this.setFilterParams) === null || _a === void 0 ? void 0 : _a.excelMode) {
            this.resetUiToActiveModel();
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
            dataPath = dataPath.map(function (treeKey) { return core_1._.toStringOrNull(core_1._.makeNull(treeKey)); });
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
        return valuesType === setValueModel_1.SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
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
