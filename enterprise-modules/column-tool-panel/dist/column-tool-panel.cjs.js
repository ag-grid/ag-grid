/**
          * @ag-grid-enterprise/column-tool-panel - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v29.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');
var rowGrouping = require('@ag-grid-enterprise/row-grouping');
var sideBar = require('@ag-grid-enterprise/side-bar');

var __extends$8 = (undefined && undefined.__extends) || (function () {
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
var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ExpandState;
(function (ExpandState) {
    ExpandState[ExpandState["EXPANDED"] = 0] = "EXPANDED";
    ExpandState[ExpandState["COLLAPSED"] = 1] = "COLLAPSED";
    ExpandState[ExpandState["INDETERMINATE"] = 2] = "INDETERMINATE";
})(ExpandState || (ExpandState = {}));
var PrimaryColsHeaderPanel = /** @class */ (function (_super) {
    __extends$8(PrimaryColsHeaderPanel, _super);
    function PrimaryColsHeaderPanel() {
        return _super.call(this, PrimaryColsHeaderPanel.TEMPLATE) || this;
    }
    PrimaryColsHeaderPanel.prototype.postConstruct = function () {
        var _this = this;
        this.createExpandIcons();
        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eExpand, 'keydown', function (e) {
            if (e.key === core.KeyCode.SPACE) {
                _this.onExpandClicked();
            }
        });
        this.addManagedListener(this.eSelect.getInputElement(), 'click', this.onSelectClicked.bind(this));
        this.eFilterTextField.onValueChange(function () { return _this.onFilterTextChanged(); });
        this.addManagedListener(this.eFilterTextField.getInputElement(), 'keypress', this.onMiniFilterKeyPress.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
        var translate = this.localeService.getLocaleTextFunc();
        this.eSelect.setInputAriaLabel(translate('ariaColumnSelectAll', 'Toggle Select All Columns'));
        this.eFilterTextField.setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'));
    };
    PrimaryColsHeaderPanel.prototype.init = function (params) {
        this.params = params;
        if (this.columnModel.isReady()) {
            this.showOrHideOptions();
        }
    };
    PrimaryColsHeaderPanel.prototype.createExpandIcons = function () {
        this.eExpand.appendChild((this.eExpandChecked = core._.createIconNoSpan('columnSelectOpen', this.gridOptionsService)));
        this.eExpand.appendChild((this.eExpandUnchecked = core._.createIconNoSpan('columnSelectClosed', this.gridOptionsService)));
        this.eExpand.appendChild((this.eExpandIndeterminate = core._.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsService)));
        this.setExpandState(ExpandState.EXPANDED);
    };
    // we only show expand / collapse if we are showing columns
    PrimaryColsHeaderPanel.prototype.showOrHideOptions = function () {
        var showFilter = !this.params.suppressColumnFilter;
        var showSelect = !this.params.suppressColumnSelectAll;
        var showExpand = !this.params.suppressColumnExpandAll;
        var groupsPresent = this.columnModel.isPrimaryColumnGroupsPresent();
        var translate = this.localeService.getLocaleTextFunc();
        this.eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));
        core._.setDisplayed(this.eFilterTextField.getGui(), showFilter);
        core._.setDisplayed(this.eSelect.getGui(), showSelect);
        core._.setDisplayed(this.eExpand, showExpand && groupsPresent);
    };
    PrimaryColsHeaderPanel.prototype.onFilterTextChanged = function () {
        var _this = this;
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = core._.debounce(function () {
                var filterText = _this.eFilterTextField.getValue();
                _this.dispatchEvent({ type: "filterChanged", filterText: filterText });
            }, PrimaryColsHeaderPanel.DEBOUNCE_DELAY);
        }
        this.onFilterTextChangedDebounced();
    };
    PrimaryColsHeaderPanel.prototype.onMiniFilterKeyPress = function (e) {
        var _this = this;
        if (e.key === core.KeyCode.ENTER) {
            // we need to add a delay that corresponds to the filter text debounce delay to ensure
            // the text filtering has happened, otherwise all columns will be deselected
            setTimeout(function () { return _this.onSelectClicked(); }, PrimaryColsHeaderPanel.DEBOUNCE_DELAY);
        }
    };
    PrimaryColsHeaderPanel.prototype.onSelectClicked = function () {
        this.dispatchEvent({ type: this.selectState ? 'unselectAll' : 'selectAll' });
    };
    PrimaryColsHeaderPanel.prototype.onExpandClicked = function () {
        this.dispatchEvent({ type: this.expandState === ExpandState.EXPANDED ? 'collapseAll' : 'expandAll' });
    };
    PrimaryColsHeaderPanel.prototype.setExpandState = function (state) {
        this.expandState = state;
        core._.setDisplayed(this.eExpandChecked, this.expandState === ExpandState.EXPANDED);
        core._.setDisplayed(this.eExpandUnchecked, this.expandState === ExpandState.COLLAPSED);
        core._.setDisplayed(this.eExpandIndeterminate, this.expandState === ExpandState.INDETERMINATE);
    };
    PrimaryColsHeaderPanel.prototype.setSelectionState = function (state) {
        this.selectState = state;
        this.eSelect.setValue(this.selectState);
    };
    PrimaryColsHeaderPanel.DEBOUNCE_DELAY = 300;
    PrimaryColsHeaderPanel.TEMPLATE = "<div class=\"ag-column-select-header\" role=\"presentation\" tabindex=\"-1\">\n            <div ref=\"eExpand\" class=\"ag-column-select-header-icon\" tabindex=\"0\"></div>\n            <ag-checkbox ref=\"eSelect\" class=\"ag-column-select-header-checkbox\"></ag-checkbox>\n            <ag-input-text-field class=\"ag-column-select-header-filter-wrapper\" ref=\"eFilterTextField\"></ag-input-text-field>\n        </div>";
    __decorate$9([
        core.Autowired('columnModel')
    ], PrimaryColsHeaderPanel.prototype, "columnModel", void 0);
    __decorate$9([
        core.RefSelector('eExpand')
    ], PrimaryColsHeaderPanel.prototype, "eExpand", void 0);
    __decorate$9([
        core.RefSelector('eSelect')
    ], PrimaryColsHeaderPanel.prototype, "eSelect", void 0);
    __decorate$9([
        core.RefSelector('eFilterTextField')
    ], PrimaryColsHeaderPanel.prototype, "eFilterTextField", void 0);
    __decorate$9([
        core.PostConstruct
    ], PrimaryColsHeaderPanel.prototype, "postConstruct", null);
    return PrimaryColsHeaderPanel;
}(core.Component));

var ColumnModelItem = /** @class */ (function () {
    function ColumnModelItem(displayName, columnOrGroup, dept, group, expanded) {
        if (group === void 0) { group = false; }
        this.eventService = new core.EventService();
        this.displayName = displayName;
        this.dept = dept;
        this.group = group;
        if (group) {
            this.columnGroup = columnOrGroup;
            this.expanded = expanded;
            this.children = [];
        }
        else {
            this.column = columnOrGroup;
        }
    }
    ColumnModelItem.prototype.isGroup = function () { return this.group; };
    ColumnModelItem.prototype.getDisplayName = function () { return this.displayName; };
    ColumnModelItem.prototype.getColumnGroup = function () { return this.columnGroup; };
    ColumnModelItem.prototype.getColumn = function () { return this.column; };
    ColumnModelItem.prototype.getDept = function () { return this.dept; };
    ColumnModelItem.prototype.isExpanded = function () { return !!this.expanded; };
    ColumnModelItem.prototype.getChildren = function () { return this.children; };
    ColumnModelItem.prototype.isPassesFilter = function () { return this.passesFilter; };
    ColumnModelItem.prototype.setExpanded = function (expanded) {
        if (expanded === this.expanded) {
            return;
        }
        this.expanded = expanded;
        this.eventService.dispatchEvent({ type: ColumnModelItem.EVENT_EXPANDED_CHANGED });
    };
    ColumnModelItem.prototype.setPassesFilter = function (passesFilter) {
        this.passesFilter = passesFilter;
    };
    ColumnModelItem.prototype.addEventListener = function (eventType, listener) {
        this.eventService.addEventListener(eventType, listener);
    };
    ColumnModelItem.prototype.removeEventListener = function (eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    };
    ColumnModelItem.EVENT_EXPANDED_CHANGED = 'expandedChanged';
    return ColumnModelItem;
}());

var __extends$7 = (undefined && undefined.__extends) || (function () {
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
var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (undefined && undefined.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var ToolPanelContextMenu = /** @class */ (function (_super) {
    __extends$7(ToolPanelContextMenu, _super);
    function ToolPanelContextMenu(column, mouseEvent, parentEl) {
        var _this = _super.call(this, /* html */ "<div class=\"ag-menu\"></div>") || this;
        _this.column = column;
        _this.mouseEvent = mouseEvent;
        _this.parentEl = parentEl;
        _this.displayName = null;
        return _this;
    }
    ToolPanelContextMenu.prototype.postConstruct = function () {
        this.initializeProperties(this.column);
        this.buildMenuItemMap();
        if (this.column instanceof core.Column) {
            this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnToolPanel');
        }
        else {
            this.displayName = this.columnModel.getDisplayNameForProvidedColumnGroup(null, this.column, 'columnToolPanel');
        }
        if (this.isActive()) {
            this.mouseEvent.preventDefault();
            this.displayContextMenu();
        }
    };
    ToolPanelContextMenu.prototype.initializeProperties = function (column) {
        if (column instanceof core.ProvidedColumnGroup) {
            this.columns = column.getLeafColumns();
        }
        else {
            this.columns = [column];
        }
        this.allowGrouping = this.columns.some(function (col) { return col.isPrimary() && col.isAllowRowGroup(); });
        this.allowValues = this.columns.some(function (col) { return col.isPrimary() && col.isAllowValue(); });
        this.allowPivoting = this.columnModel.isPivotMode() && this.columns.some(function (col) { return col.isPrimary() && col.isAllowPivot(); });
    };
    ToolPanelContextMenu.prototype.buildMenuItemMap = function () {
        var _this = this;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        this.menuItemMap = new Map();
        this.menuItemMap.set('rowGroup', {
            allowedFunction: function (col) { return col.isPrimary() && col.isAllowRowGroup(); },
            activeFunction: function (col) { return col.isRowGroupActive(); },
            activateLabel: function () { return localeTextFunc('groupBy', 'Group by') + " " + _this.displayName; },
            deactivateLabel: function () { return localeTextFunc('ungroupBy', 'Un-Group by') + " " + _this.displayName; },
            activateFunction: function () {
                var groupedColumns = _this.columnModel.getRowGroupColumns();
                _this.columnModel.setRowGroupColumns(_this.addColumnsToList(groupedColumns), "toolPanelUi");
            },
            deActivateFunction: function () {
                var groupedColumns = _this.columnModel.getRowGroupColumns();
                _this.columnModel.setRowGroupColumns(_this.removeColumnsFromList(groupedColumns), "toolPanelUi");
            },
            addIcon: 'menuAddRowGroup',
            removeIcon: 'menuRemoveRowGroup'
        });
        this.menuItemMap.set('value', {
            allowedFunction: function (col) { return col.isPrimary() && col.isAllowValue(); },
            activeFunction: function (col) { return col.isValueActive(); },
            activateLabel: function () { return localeTextFunc('addToValues', "Add " + _this.displayName + " to values", [_this.displayName]); },
            deactivateLabel: function () { return localeTextFunc('removeFromValues', "Remove " + _this.displayName + " from values", [_this.displayName]); },
            activateFunction: function () {
                var valueColumns = _this.columnModel.getValueColumns();
                _this.columnModel.setValueColumns(_this.addColumnsToList(valueColumns), "toolPanelUi");
            },
            deActivateFunction: function () {
                var valueColumns = _this.columnModel.getValueColumns();
                _this.columnModel.setValueColumns(_this.removeColumnsFromList(valueColumns), "toolPanelUi");
            },
            addIcon: 'valuePanel',
            removeIcon: 'valuePanel'
        });
        this.menuItemMap.set('pivot', {
            allowedFunction: function (col) { return _this.columnModel.isPivotMode() && col.isPrimary() && col.isAllowPivot(); },
            activeFunction: function (col) { return col.isPivotActive(); },
            activateLabel: function () { return localeTextFunc('addToLabels', "Add " + _this.displayName + " to labels", [_this.displayName]); },
            deactivateLabel: function () { return localeTextFunc('removeFromLabels', "Remove " + _this.displayName + " from labels", [_this.displayName]); },
            activateFunction: function () {
                var pivotColumns = _this.columnModel.getPivotColumns();
                _this.columnModel.setPivotColumns(_this.addColumnsToList(pivotColumns), "toolPanelUi");
            },
            deActivateFunction: function () {
                var pivotColumns = _this.columnModel.getPivotColumns();
                _this.columnModel.setPivotColumns(_this.removeColumnsFromList(pivotColumns), "toolPanelUi");
            },
            addIcon: 'pivotPanel',
            removeIcon: 'pivotPanel'
        });
    };
    ToolPanelContextMenu.prototype.addColumnsToList = function (columnList) {
        return __spread(columnList).concat(this.columns.filter(function (col) { return columnList.indexOf(col) === -1; }));
    };
    ToolPanelContextMenu.prototype.removeColumnsFromList = function (columnList) {
        var _this = this;
        return columnList.filter(function (col) { return _this.columns.indexOf(col) === -1; });
    };
    ToolPanelContextMenu.prototype.displayContextMenu = function () {
        var _this = this;
        var eGui = this.getGui();
        var menuList = this.createBean(new core.AgMenuList());
        var menuItemsMapped = this.getMappedMenuItems();
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var hideFunc = function () { };
        eGui.appendChild(menuList.getGui());
        menuList.addMenuItems(menuItemsMapped);
        menuList.addManagedListener(menuList, core.AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, function () {
            _this.parentEl.focus();
            hideFunc();
        });
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eGui,
            closeOnEsc: true,
            afterGuiAttached: function () { return _this.focusService.focusInto(menuList.getGui()); },
            ariaLabel: localeTextFunc('ariaLabelContextMenu', 'Context Menu'),
            closedCallback: function (e) {
                if (e instanceof KeyboardEvent) {
                    _this.parentEl.focus();
                }
                _this.destroyBean(menuList);
            }
        });
        if (addPopupRes) {
            hideFunc = addPopupRes.hideFunc;
        }
        this.popupService.positionPopupUnderMouseEvent({
            type: 'columnContextMenu',
            mouseEvent: this.mouseEvent,
            ePopup: eGui
        });
    };
    ToolPanelContextMenu.prototype.isActive = function () {
        return this.allowGrouping || this.allowValues || this.allowPivoting;
    };
    ToolPanelContextMenu.prototype.getMappedMenuItems = function () {
        var e_1, _a;
        var ret = [];
        var _loop_1 = function (val) {
            var isInactive = this_1.columns.some(function (col) { return val.allowedFunction(col) && !val.activeFunction(col); });
            var isActive = this_1.columns.some(function (col) { return val.allowedFunction(col) && val.activeFunction(col); });
            if (isInactive) {
                ret.push({
                    name: val.activateLabel(this_1.displayName),
                    icon: core._.createIconNoSpan(val.addIcon, this_1.gridOptionsService, null),
                    action: function () { return val.activateFunction(); }
                });
            }
            if (isActive) {
                ret.push({
                    name: val.deactivateLabel(this_1.displayName),
                    icon: core._.createIconNoSpan(val.removeIcon, this_1.gridOptionsService, null),
                    action: function () { return val.deActivateFunction(); }
                });
            }
        };
        var this_1 = this;
        try {
            for (var _b = __values(this.menuItemMap.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var val = _c.value;
                _loop_1(val);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return ret;
    };
    __decorate$8([
        core.Autowired('columnModel')
    ], ToolPanelContextMenu.prototype, "columnModel", void 0);
    __decorate$8([
        core.Autowired('popupService')
    ], ToolPanelContextMenu.prototype, "popupService", void 0);
    __decorate$8([
        core.Autowired('focusService')
    ], ToolPanelContextMenu.prototype, "focusService", void 0);
    __decorate$8([
        core.PostConstruct
    ], ToolPanelContextMenu.prototype, "postConstruct", null);
    return ToolPanelContextMenu;
}(core.Component));

var __extends$6 = (undefined && undefined.__extends) || (function () {
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
var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ToolPanelColumnGroupComp = /** @class */ (function (_super) {
    __extends$6(ToolPanelColumnGroupComp, _super);
    function ToolPanelColumnGroupComp(modelItem, allowDragging, eventType, focusWrapper) {
        var _this = _super.call(this) || this;
        _this.modelItem = modelItem;
        _this.allowDragging = allowDragging;
        _this.eventType = eventType;
        _this.focusWrapper = focusWrapper;
        _this.processingColumnStateChange = false;
        _this.modelItem = modelItem;
        _this.columnGroup = modelItem.getColumnGroup();
        _this.columnDept = modelItem.getDept();
        _this.allowDragging = allowDragging;
        return _this;
    }
    ToolPanelColumnGroupComp.prototype.init = function () {
        var _this = this;
        this.setTemplate(ToolPanelColumnGroupComp.TEMPLATE);
        this.eDragHandle = core._.createIconNoSpan('columnDrag', this.gridOptionsService);
        this.eDragHandle.classList.add('ag-drag-handle', 'ag-column-select-column-group-drag-handle');
        var checkboxGui = this.cbSelect.getGui();
        var checkboxInput = this.cbSelect.getInputElement();
        checkboxGui.insertAdjacentElement('afterend', this.eDragHandle);
        checkboxInput.setAttribute('tabindex', '-1');
        this.displayName = this.columnModel.getDisplayNameForProvidedColumnGroup(null, this.columnGroup, this.eventType);
        if (core._.missing(this.displayName)) {
            this.displayName = '>>';
        }
        this.eLabel.innerHTML = this.displayName ? this.displayName : '';
        this.setupExpandContract();
        this.addCssClass('ag-column-select-indent-' + this.columnDept);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.addManagedListener(this.cbSelect, core.AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addManagedListener(this.modelItem, ColumnModelItem.EVENT_EXPANDED_CHANGED, this.onExpandChanged.bind(this));
        this.addManagedListener(this.focusWrapper, 'keydown', this.handleKeyDown.bind(this));
        this.addManagedListener(this.focusWrapper, 'contextmenu', this.onContextMenu.bind(this));
        this.setOpenClosedIcons();
        this.setupDragging();
        this.onColumnStateChanged();
        this.addVisibilityListenersToAllChildren();
        this.refreshAriaExpanded();
        this.refreshAriaLabel();
        this.setupTooltip();
        var classes = core.CssClassApplier.getToolPanelClassesFromColDef(this.columnGroup.getColGroupDef(), this.gridOptionsService, null, this.columnGroup);
        classes.forEach(function (c) { return _this.addOrRemoveCssClass(c, true); });
    };
    ToolPanelColumnGroupComp.prototype.getColumns = function () {
        return this.columnGroup.getLeafColumns();
    };
    ToolPanelColumnGroupComp.prototype.setupTooltip = function () {
        var _this = this;
        var colGroupDef = this.columnGroup.getColGroupDef();
        if (!colGroupDef) {
            return;
        }
        var refresh = function () {
            var newTooltipText = colGroupDef.headerTooltip;
            _this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    };
    ToolPanelColumnGroupComp.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'columnToolPanelColumnGroup';
        return res;
    };
    ToolPanelColumnGroupComp.prototype.handleKeyDown = function (e) {
        switch (e.key) {
            case core.KeyCode.LEFT:
                e.preventDefault();
                this.modelItem.setExpanded(false);
                break;
            case core.KeyCode.RIGHT:
                e.preventDefault();
                this.modelItem.setExpanded(true);
                break;
            case core.KeyCode.SPACE:
                e.preventDefault();
                if (this.isSelectable()) {
                    this.onSelectAllChanged(!this.isSelected());
                }
                break;
        }
    };
    ToolPanelColumnGroupComp.prototype.onContextMenu = function (e) {
        var _this = this;
        var _a = this, columnGroup = _a.columnGroup, gridOptionsService = _a.gridOptionsService;
        if (gridOptionsService.is('functionsReadOnly')) {
            return;
        }
        var contextMenu = this.createBean(new ToolPanelContextMenu(columnGroup, e, this.focusWrapper));
        this.addDestroyFunc(function () {
            if (contextMenu.isAlive()) {
                _this.destroyBean(contextMenu);
            }
        });
    };
    ToolPanelColumnGroupComp.prototype.addVisibilityListenersToAllChildren = function () {
        var _this = this;
        this.columnGroup.getLeafColumns().forEach(function (column) {
            _this.addManagedListener(column, core.Column.EVENT_VISIBLE_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addManagedListener(column, core.Column.EVENT_VALUE_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addManagedListener(column, core.Column.EVENT_PIVOT_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addManagedListener(column, core.Column.EVENT_ROW_GROUP_CHANGED, _this.onColumnStateChanged.bind(_this));
        });
    };
    ToolPanelColumnGroupComp.prototype.setupDragging = function () {
        var _this = this;
        if (!this.allowDragging) {
            core._.setDisplayed(this.eDragHandle, false);
            return;
        }
        var hideColumnOnExit = !this.gridOptionsService.is('suppressDragLeaveHidesColumns');
        var dragSource = {
            type: core.DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            dragItemName: this.displayName,
            defaultIconName: hideColumnOnExit ? core.DragAndDropService.ICON_HIDE : core.DragAndDropService.ICON_NOT_ALLOWED,
            getDragItem: function () { return _this.createDragItem(); },
            onDragStarted: function () {
                var event = {
                    type: core.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
                    column: _this.columnGroup
                };
                _this.eventService.dispatchEvent(event);
            },
            onDragStopped: function () {
                var event = {
                    type: core.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END
                };
                _this.eventService.dispatchEvent(event);
            },
            onGridEnter: function () {
                if (hideColumnOnExit) {
                    // when dragged into the grid, mimic what happens when checkbox is enabled
                    // this handles the behaviour for pivot which is different to just hiding a column.
                    _this.onChangeCommon(true);
                }
            },
            onGridExit: function () {
                if (hideColumnOnExit) {
                    // when dragged outside of the grid, mimic what happens when checkbox is disabled
                    // this handles the behaviour for pivot which is different to just hiding a column.
                    _this.onChangeCommon(false);
                }
            }
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    ToolPanelColumnGroupComp.prototype.createDragItem = function () {
        var visibleState = {};
        this.columnGroup.getLeafColumns().forEach(function (col) {
            visibleState[col.getId()] = col.isVisible();
        });
        return {
            columns: this.columnGroup.getLeafColumns(),
            visibleState: visibleState
        };
    };
    ToolPanelColumnGroupComp.prototype.setupExpandContract = function () {
        this.eGroupClosedIcon.appendChild(core._.createIcon('columnSelectClosed', this.gridOptionsService, null));
        this.eGroupOpenedIcon.appendChild(core._.createIcon('columnSelectOpen', this.gridOptionsService, null));
        this.addManagedListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addManagedListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        var touchListener = new core.TouchListener(this.eColumnGroupIcons, true);
        this.addManagedListener(touchListener, core.TouchListener.EVENT_TAP, this.onExpandOrContractClicked.bind(this));
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    };
    ToolPanelColumnGroupComp.prototype.onLabelClicked = function () {
        var nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    };
    ToolPanelColumnGroupComp.prototype.onCheckboxChanged = function (event) {
        this.onChangeCommon(event.selected);
    };
    ToolPanelColumnGroupComp.prototype.getVisibleLeafColumns = function () {
        var childColumns = [];
        var extractCols = function (children) {
            children.forEach(function (child) {
                if (!child.isPassesFilter()) {
                    return;
                }
                if (child.isGroup()) {
                    extractCols(child.getChildren());
                }
                else {
                    childColumns.push(child.getColumn());
                }
            });
        };
        extractCols(this.modelItem.getChildren());
        return childColumns;
    };
    ToolPanelColumnGroupComp.prototype.onChangeCommon = function (nextState) {
        this.refreshAriaLabel();
        if (this.processingColumnStateChange) {
            return;
        }
        this.modelItemUtils.selectAllChildren(this.modelItem.getChildren(), nextState, this.eventType);
    };
    ToolPanelColumnGroupComp.prototype.refreshAriaLabel = function () {
        var translate = this.localeService.getLocaleTextFunc();
        var columnLabel = translate('ariaColumnGroup', 'Column Group');
        var checkboxValue = this.cbSelect.getValue();
        var state = checkboxValue === undefined ?
            translate('ariaIndeterminate', 'indeterminate') :
            (checkboxValue ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden'));
        var visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        core._.setAriaLabel(this.focusWrapper, this.displayName + " " + columnLabel);
        this.cbSelect.setInputAriaLabel(visibilityLabel + " (" + state + ")");
        core._.setAriaDescribedBy(this.focusWrapper, this.cbSelect.getInputElement().id);
    };
    ToolPanelColumnGroupComp.prototype.onColumnStateChanged = function () {
        var selectedValue = this.workOutSelectedValue();
        var readOnlyValue = this.workOutReadOnlyValue();
        this.processingColumnStateChange = true;
        this.cbSelect.setValue(selectedValue);
        this.cbSelect.setReadOnly(readOnlyValue);
        this.addOrRemoveCssClass('ag-column-select-column-group-readonly', readOnlyValue);
        this.processingColumnStateChange = false;
    };
    ToolPanelColumnGroupComp.prototype.workOutSelectedValue = function () {
        var _this = this;
        var pivotMode = this.columnModel.isPivotMode();
        var visibleLeafColumns = this.getVisibleLeafColumns();
        var checkedCount = 0;
        var uncheckedCount = 0;
        visibleLeafColumns.forEach(function (column) {
            if (!pivotMode && column.getColDef().lockVisible) {
                return;
            }
            if (_this.isColumnChecked(column, pivotMode)) {
                checkedCount++;
            }
            else {
                uncheckedCount++;
            }
        });
        if (checkedCount > 0 && uncheckedCount > 0) {
            return undefined;
        }
        return checkedCount > 0;
    };
    ToolPanelColumnGroupComp.prototype.workOutReadOnlyValue = function () {
        var pivotMode = this.columnModel.isPivotMode();
        var colsThatCanAction = 0;
        this.columnGroup.getLeafColumns().forEach(function (col) {
            if (pivotMode) {
                if (col.isAnyFunctionAllowed()) {
                    colsThatCanAction++;
                }
            }
            else {
                if (!col.getColDef().lockVisible) {
                    colsThatCanAction++;
                }
            }
        });
        return colsThatCanAction === 0;
    };
    ToolPanelColumnGroupComp.prototype.isColumnChecked = function (column, pivotMode) {
        if (pivotMode) {
            var pivoted = column.isPivotActive();
            var grouped = column.isRowGroupActive();
            var aggregated = column.isValueActive();
            return pivoted || grouped || aggregated;
        }
        return column.isVisible();
    };
    ToolPanelColumnGroupComp.prototype.onExpandOrContractClicked = function () {
        var oldState = this.modelItem.isExpanded();
        this.modelItem.setExpanded(!oldState);
    };
    ToolPanelColumnGroupComp.prototype.onExpandChanged = function () {
        this.setOpenClosedIcons();
        this.refreshAriaExpanded();
    };
    ToolPanelColumnGroupComp.prototype.setOpenClosedIcons = function () {
        var folderOpen = this.modelItem.isExpanded();
        core._.setDisplayed(this.eGroupClosedIcon, !folderOpen);
        core._.setDisplayed(this.eGroupOpenedIcon, folderOpen);
    };
    ToolPanelColumnGroupComp.prototype.refreshAriaExpanded = function () {
        core._.setAriaExpanded(this.focusWrapper, this.modelItem.isExpanded());
    };
    ToolPanelColumnGroupComp.prototype.getDisplayName = function () {
        return this.displayName;
    };
    ToolPanelColumnGroupComp.prototype.onSelectAllChanged = function (value) {
        var cbValue = this.cbSelect.getValue();
        var readOnly = this.cbSelect.isReadOnly();
        if (!readOnly && ((value && !cbValue) || (!value && cbValue))) {
            this.cbSelect.toggle();
        }
    };
    ToolPanelColumnGroupComp.prototype.isSelected = function () {
        return this.cbSelect.getValue();
    };
    ToolPanelColumnGroupComp.prototype.isSelectable = function () {
        return !this.cbSelect.isReadOnly();
    };
    ToolPanelColumnGroupComp.prototype.setSelected = function (selected) {
        this.cbSelect.setValue(selected, true);
    };
    ToolPanelColumnGroupComp.TEMPLATE = "<div class=\"ag-column-select-column-group\" aria-hidden=\"true\">\n            <span class=\"ag-column-group-icons\" ref=\"eColumnGroupIcons\" >\n                <span class=\"ag-column-group-closed-icon\" ref=\"eGroupClosedIcon\"></span>\n                <span class=\"ag-column-group-opened-icon\" ref=\"eGroupOpenedIcon\"></span>\n            </span>\n            <ag-checkbox ref=\"cbSelect\" class=\"ag-column-select-checkbox\"></ag-checkbox>\n            <span class=\"ag-column-select-column-label\" ref=\"eLabel\"></span>\n        </div>";
    __decorate$7([
        core.Autowired('columnModel')
    ], ToolPanelColumnGroupComp.prototype, "columnModel", void 0);
    __decorate$7([
        core.Autowired('dragAndDropService')
    ], ToolPanelColumnGroupComp.prototype, "dragAndDropService", void 0);
    __decorate$7([
        core.Autowired('modelItemUtils')
    ], ToolPanelColumnGroupComp.prototype, "modelItemUtils", void 0);
    __decorate$7([
        core.RefSelector('cbSelect')
    ], ToolPanelColumnGroupComp.prototype, "cbSelect", void 0);
    __decorate$7([
        core.RefSelector('eLabel')
    ], ToolPanelColumnGroupComp.prototype, "eLabel", void 0);
    __decorate$7([
        core.RefSelector('eGroupOpenedIcon')
    ], ToolPanelColumnGroupComp.prototype, "eGroupOpenedIcon", void 0);
    __decorate$7([
        core.RefSelector('eGroupClosedIcon')
    ], ToolPanelColumnGroupComp.prototype, "eGroupClosedIcon", void 0);
    __decorate$7([
        core.RefSelector('eColumnGroupIcons')
    ], ToolPanelColumnGroupComp.prototype, "eColumnGroupIcons", void 0);
    __decorate$7([
        core.PostConstruct
    ], ToolPanelColumnGroupComp.prototype, "init", null);
    return ToolPanelColumnGroupComp;
}(core.Component));

var __extends$5 = (undefined && undefined.__extends) || (function () {
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
var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PRIMARY_COLS_LIST_ITEM_HOVERED = 'ag-list-item-hovered';
var PrimaryColsListPanelItemDragFeature = /** @class */ (function (_super) {
    __extends$5(PrimaryColsListPanelItemDragFeature, _super);
    function PrimaryColsListPanelItemDragFeature(comp, virtualList) {
        var _this = _super.call(this) || this;
        _this.comp = comp;
        _this.virtualList = virtualList;
        _this.currentDragColumn = null;
        _this.lastHoveredColumnItem = null;
        return _this;
    }
    PrimaryColsListPanelItemDragFeature.prototype.postConstruct = function () {
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START, this.columnPanelItemDragStart.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END, this.columnPanelItemDragEnd.bind(this));
        this.createDropTarget();
        this.createAutoScrollService();
    };
    PrimaryColsListPanelItemDragFeature.prototype.columnPanelItemDragStart = function (_a) {
        var column = _a.column;
        this.currentDragColumn = column;
        var currentColumns = this.getCurrentColumns();
        var hasNotMovable = currentColumns.find(function (col) {
            var colDef = col.getColDef();
            return !!colDef.suppressMovable || !!colDef.lockPosition;
        });
        if (hasNotMovable) {
            this.moveBlocked = true;
        }
    };
    PrimaryColsListPanelItemDragFeature.prototype.columnPanelItemDragEnd = function () {
        var _this = this;
        window.setTimeout(function () {
            _this.currentDragColumn = null;
            _this.moveBlocked = false;
        }, 10);
    };
    PrimaryColsListPanelItemDragFeature.prototype.createDropTarget = function () {
        var _this = this;
        var dropTarget = {
            isInterestedIn: function (type) { return type === core.DragSourceType.ToolPanel; },
            getIconName: function () { return core.DragAndDropService[_this.moveBlocked ? 'ICON_NOT_ALLOWED' : 'ICON_MOVE']; },
            getContainer: function () { return _this.comp.getGui(); },
            onDragging: function (e) { return _this.onDragging(e); },
            onDragStop: function () { return _this.onDragStop(); },
            onDragLeave: function () { return _this.onDragLeave(); }
        };
        this.dragAndDropService.addDropTarget(dropTarget);
    };
    PrimaryColsListPanelItemDragFeature.prototype.createAutoScrollService = function () {
        var virtualListGui = this.virtualList.getGui();
        this.autoScrollService = new core.AutoScrollService({
            scrollContainer: virtualListGui,
            scrollAxis: 'y',
            getVerticalPosition: function () { return virtualListGui.scrollTop; },
            setVerticalPosition: function (position) { return virtualListGui.scrollTop = position; }
        });
    };
    PrimaryColsListPanelItemDragFeature.prototype.onDragging = function (e) {
        if (!this.currentDragColumn || this.moveBlocked) {
            return;
        }
        var hoveredColumnItem = this.getDragColumnItem(e);
        var comp = this.virtualList.getComponentAt(hoveredColumnItem.rowIndex);
        if (!comp) {
            return;
        }
        var el = comp.getGui().parentElement;
        if (this.lastHoveredColumnItem &&
            this.lastHoveredColumnItem.rowIndex === hoveredColumnItem.rowIndex &&
            this.lastHoveredColumnItem.position === hoveredColumnItem.position) {
            return;
        }
        this.autoScrollService.check(e.event);
        this.clearHoveredItems();
        this.lastHoveredColumnItem = hoveredColumnItem;
        core._.radioCssClass(el, "" + PRIMARY_COLS_LIST_ITEM_HOVERED);
        core._.radioCssClass(el, "ag-item-highlight-" + hoveredColumnItem.position);
    };
    PrimaryColsListPanelItemDragFeature.prototype.getDragColumnItem = function (e) {
        var virtualListGui = this.virtualList.getGui();
        var paddingTop = parseFloat(window.getComputedStyle(virtualListGui).paddingTop);
        var rowHeight = this.virtualList.getRowHeight();
        var scrollTop = this.virtualList.getScrollTop();
        var rowIndex = Math.max(0, (e.y - paddingTop + scrollTop) / rowHeight);
        var maxLen = this.comp.getDisplayedColsList().length - 1;
        var normalizedRowIndex = Math.min(maxLen, rowIndex) | 0;
        return {
            rowIndex: normalizedRowIndex,
            position: (Math.round(rowIndex) > rowIndex || rowIndex > maxLen) ? 'bottom' : 'top',
            component: this.virtualList.getComponentAt(normalizedRowIndex)
        };
    };
    PrimaryColsListPanelItemDragFeature.prototype.onDragStop = function () {
        if (this.moveBlocked) {
            return;
        }
        var targetIndex = this.getTargetIndex();
        var columnsToMove = this.getCurrentColumns();
        if (targetIndex != null) {
            this.columnModel.moveColumns(columnsToMove, targetIndex, 'toolPanelUi');
        }
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    };
    PrimaryColsListPanelItemDragFeature.prototype.getMoveDiff = function (end) {
        var allColumns = this.columnModel.getAllGridColumns();
        var currentColumns = this.getCurrentColumns();
        var currentColumn = currentColumns[0];
        var span = currentColumns.length;
        var currentIndex = allColumns.indexOf(currentColumn);
        if (currentIndex < end) {
            return span;
        }
        return 0;
    };
    PrimaryColsListPanelItemDragFeature.prototype.getCurrentColumns = function () {
        if (this.currentDragColumn instanceof core.ProvidedColumnGroup) {
            return this.currentDragColumn.getLeafColumns();
        }
        return [this.currentDragColumn];
    };
    PrimaryColsListPanelItemDragFeature.prototype.getTargetIndex = function () {
        if (!this.lastHoveredColumnItem) {
            return null;
        }
        var columnItemComponent = this.lastHoveredColumnItem.component;
        var isBefore = this.lastHoveredColumnItem.position === 'top';
        var targetColumn;
        if (columnItemComponent instanceof ToolPanelColumnGroupComp) {
            var columns = columnItemComponent.getColumns();
            targetColumn = columns[0];
            isBefore = true;
        }
        else {
            targetColumn = columnItemComponent.getColumn();
        }
        var targetColumnIndex = this.columnModel.getAllGridColumns().indexOf(targetColumn);
        var adjustedTarget = isBefore ? targetColumnIndex : targetColumnIndex + 1;
        var diff = this.getMoveDiff(adjustedTarget);
        return adjustedTarget - diff;
    };
    PrimaryColsListPanelItemDragFeature.prototype.onDragLeave = function () {
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    };
    PrimaryColsListPanelItemDragFeature.prototype.clearHoveredItems = function () {
        var virtualListGui = this.virtualList.getGui();
        virtualListGui.querySelectorAll("." + PRIMARY_COLS_LIST_ITEM_HOVERED).forEach(function (el) {
            [
                PRIMARY_COLS_LIST_ITEM_HOVERED,
                'ag-item-highlight-top',
                'ag-item-highlight-bottom'
            ].forEach(function (cls) {
                el.classList.remove(cls);
            });
        });
        this.lastHoveredColumnItem = null;
    };
    __decorate$6([
        core.Autowired('columnModel')
    ], PrimaryColsListPanelItemDragFeature.prototype, "columnModel", void 0);
    __decorate$6([
        core.Autowired('dragAndDropService')
    ], PrimaryColsListPanelItemDragFeature.prototype, "dragAndDropService", void 0);
    __decorate$6([
        core.PostConstruct
    ], PrimaryColsListPanelItemDragFeature.prototype, "postConstruct", null);
    return PrimaryColsListPanelItemDragFeature;
}(core.BeanStub));

var __extends$4 = (undefined && undefined.__extends) || (function () {
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
var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ToolPanelColumnComp = /** @class */ (function (_super) {
    __extends$4(ToolPanelColumnComp, _super);
    function ToolPanelColumnComp(column, columnDept, allowDragging, groupsExist, focusWrapper) {
        var _this = _super.call(this) || this;
        _this.column = column;
        _this.columnDept = columnDept;
        _this.allowDragging = allowDragging;
        _this.groupsExist = groupsExist;
        _this.focusWrapper = focusWrapper;
        _this.processingColumnStateChange = false;
        return _this;
    }
    ToolPanelColumnComp.prototype.init = function () {
        var _this = this;
        this.setTemplate(ToolPanelColumnComp.TEMPLATE);
        this.eDragHandle = core._.createIconNoSpan('columnDrag', this.gridOptionsService);
        this.eDragHandle.classList.add('ag-drag-handle', 'ag-column-select-column-drag-handle');
        var checkboxGui = this.cbSelect.getGui();
        var checkboxInput = this.cbSelect.getInputElement();
        checkboxGui.insertAdjacentElement('afterend', this.eDragHandle);
        checkboxInput.setAttribute('tabindex', '-1');
        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnToolPanel');
        var displayNameSanitised = core._.escapeString(this.displayName);
        this.eLabel.innerHTML = displayNameSanitised;
        // if grouping, we add an extra level of indent, to cater for expand/contract icons we need to indent for
        var indent = this.columnDept;
        if (this.groupsExist) {
            this.addCssClass('ag-column-select-add-group-indent');
        }
        this.addCssClass("ag-column-select-indent-" + indent);
        this.setupDragging();
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, core.Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, core.Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, core.Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, core.Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.focusWrapper, 'keydown', this.handleKeyDown.bind(this));
        this.addManagedListener(this.focusWrapper, 'contextmenu', this.onContextMenu.bind(this));
        this.addManagedPropertyListener('functionsReadOnly', this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.cbSelect, core.AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.onColumnStateChanged();
        this.refreshAriaLabel();
        this.setupTooltip();
        var classes = core.CssClassApplier.getToolPanelClassesFromColDef(this.column.getColDef(), this.gridOptionsService, this.column, null);
        classes.forEach(function (c) { return _this.addOrRemoveCssClass(c, true); });
    };
    ToolPanelColumnComp.prototype.getColumn = function () {
        return this.column;
    };
    ToolPanelColumnComp.prototype.setupTooltip = function () {
        var _this = this;
        var refresh = function () {
            var newTooltipText = _this.column.getColDef().headerTooltip;
            _this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    };
    ToolPanelColumnComp.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'columnToolPanelColumn';
        res.colDef = this.column.getColDef();
        return res;
    };
    ToolPanelColumnComp.prototype.onContextMenu = function (e) {
        var _this = this;
        var _a = this, column = _a.column, gridOptionsService = _a.gridOptionsService;
        if (gridOptionsService.is('functionsReadOnly')) {
            return;
        }
        var contextMenu = this.createBean(new ToolPanelContextMenu(column, e, this.focusWrapper));
        this.addDestroyFunc(function () {
            if (contextMenu.isAlive()) {
                _this.destroyBean(contextMenu);
            }
        });
    };
    ToolPanelColumnComp.prototype.handleKeyDown = function (e) {
        if (e.key === core.KeyCode.SPACE) {
            e.preventDefault();
            if (this.isSelectable()) {
                this.onSelectAllChanged(!this.isSelected());
            }
        }
    };
    ToolPanelColumnComp.prototype.onLabelClicked = function () {
        if (this.gridOptionsService.is('functionsReadOnly')) {
            return;
        }
        var nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    };
    ToolPanelColumnComp.prototype.onCheckboxChanged = function (event) {
        this.onChangeCommon(event.selected);
    };
    ToolPanelColumnComp.prototype.onChangeCommon = function (nextState) {
        // ignore lock visible columns
        if (this.cbSelect.isReadOnly()) {
            return;
        }
        this.refreshAriaLabel();
        // only want to action if the user clicked the checkbox, not if we are setting the checkbox because
        // of a change in the model
        if (this.processingColumnStateChange) {
            return;
        }
        this.modelItemUtils.setColumn(this.column, nextState, 'toolPanelUi');
    };
    ToolPanelColumnComp.prototype.refreshAriaLabel = function () {
        var translate = this.localeService.getLocaleTextFunc();
        var columnLabel = translate('ariaColumn', 'Column');
        var state = this.cbSelect.getValue() ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden');
        var visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        core._.setAriaLabel(this.focusWrapper, this.displayName + " " + columnLabel);
        this.cbSelect.setInputAriaLabel(visibilityLabel + " (" + state + ")");
        core._.setAriaDescribedBy(this.focusWrapper, this.cbSelect.getInputElement().id);
    };
    ToolPanelColumnComp.prototype.setupDragging = function () {
        var _this = this;
        if (!this.allowDragging) {
            core._.setDisplayed(this.eDragHandle, false);
            return;
        }
        var hideColumnOnExit = !this.gridOptionsService.is('suppressDragLeaveHidesColumns');
        var dragSource = {
            type: core.DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            dragItemName: this.displayName,
            defaultIconName: hideColumnOnExit ? core.DragAndDropService.ICON_HIDE : core.DragAndDropService.ICON_NOT_ALLOWED,
            getDragItem: function () { return _this.createDragItem(); },
            onDragStarted: function () {
                var event = {
                    type: core.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
                    column: _this.column
                };
                _this.eventService.dispatchEvent(event);
            },
            onDragStopped: function () {
                var event = {
                    type: core.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END
                };
                _this.eventService.dispatchEvent(event);
            },
            onGridEnter: function () {
                if (hideColumnOnExit) {
                    // when dragged into the grid, mimic what happens when checkbox is enabled
                    // this handles the behaviour for pivot which is different to just hiding a column.
                    _this.onChangeCommon(true);
                }
            },
            onGridExit: function () {
                if (hideColumnOnExit) {
                    // when dragged outside of the grid, mimic what happens when checkbox is disabled
                    // this handles the behaviour for pivot which is different to just hiding a column.
                    _this.onChangeCommon(false);
                }
            }
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    ToolPanelColumnComp.prototype.createDragItem = function () {
        var visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    };
    ToolPanelColumnComp.prototype.onColumnStateChanged = function () {
        this.processingColumnStateChange = true;
        var isPivotMode = this.columnModel.isPivotMode();
        if (isPivotMode) {
            // if reducing, checkbox means column is one of pivot, value or group
            var anyFunctionActive = this.column.isAnyFunctionActive();
            this.cbSelect.setValue(anyFunctionActive);
        }
        else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setValue(this.column.isVisible());
        }
        var canBeToggled = true;
        var canBeDragged = true;
        if (isPivotMode) {
            // when in pivot mode, the item should be read only if:
            //  a) gui is not allowed make any changes
            var functionsReadOnly = this.gridOptionsService.is('functionsReadOnly');
            //  b) column is not allow any functions on it
            var noFunctionsAllowed = !this.column.isAnyFunctionAllowed();
            canBeToggled = !functionsReadOnly && !noFunctionsAllowed;
            canBeDragged = canBeToggled;
        }
        else {
            var _a = this.column.getColDef(), enableRowGroup = _a.enableRowGroup, enableValue = _a.enableValue, lockPosition = _a.lockPosition, suppressMovable = _a.suppressMovable, lockVisible = _a.lockVisible;
            var forceDraggable = !!enableRowGroup || !!enableValue;
            var disableDraggable = !!lockPosition || !!suppressMovable;
            canBeToggled = !lockVisible;
            canBeDragged = forceDraggable || !disableDraggable;
        }
        this.cbSelect.setReadOnly(!canBeToggled);
        this.eDragHandle.classList.toggle('ag-column-select-column-readonly', !canBeDragged);
        this.addOrRemoveCssClass('ag-column-select-column-readonly', !canBeDragged && !canBeToggled);
        var checkboxPassive = isPivotMode && this.gridOptionsService.is('functionsPassive');
        this.cbSelect.setPassive(checkboxPassive);
        this.processingColumnStateChange = false;
    };
    ToolPanelColumnComp.prototype.getDisplayName = function () {
        return this.displayName;
    };
    ToolPanelColumnComp.prototype.onSelectAllChanged = function (value) {
        if (value !== this.cbSelect.getValue()) {
            if (!this.cbSelect.isReadOnly()) {
                this.cbSelect.toggle();
            }
        }
    };
    ToolPanelColumnComp.prototype.isSelected = function () {
        return this.cbSelect.getValue();
    };
    ToolPanelColumnComp.prototype.isSelectable = function () {
        return !this.cbSelect.isReadOnly();
    };
    ToolPanelColumnComp.prototype.isExpandable = function () {
        return false;
    };
    ToolPanelColumnComp.prototype.setExpanded = function (value) {
        console.warn('AG Grid: can not expand a column item that does not represent a column group header');
    };
    ToolPanelColumnComp.TEMPLATE = "<div class=\"ag-column-select-column\" aria-hidden=\"true\">\n            <ag-checkbox ref=\"cbSelect\" class=\"ag-column-select-checkbox\"></ag-checkbox>\n            <span class=\"ag-column-select-column-label\" ref=\"eLabel\"></span>\n        </div>";
    __decorate$5([
        core.Autowired('columnModel')
    ], ToolPanelColumnComp.prototype, "columnModel", void 0);
    __decorate$5([
        core.Autowired('dragAndDropService')
    ], ToolPanelColumnComp.prototype, "dragAndDropService", void 0);
    __decorate$5([
        core.Autowired('modelItemUtils')
    ], ToolPanelColumnComp.prototype, "modelItemUtils", void 0);
    __decorate$5([
        core.RefSelector('eLabel')
    ], ToolPanelColumnComp.prototype, "eLabel", void 0);
    __decorate$5([
        core.RefSelector('cbSelect')
    ], ToolPanelColumnComp.prototype, "cbSelect", void 0);
    __decorate$5([
        core.PostConstruct
    ], ToolPanelColumnComp.prototype, "init", null);
    return ToolPanelColumnComp;
}(core.Component));

var __extends$3 = (undefined && undefined.__extends) || (function () {
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
var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var UIColumnModel = /** @class */ (function () {
    function UIColumnModel(items) {
        this.items = items;
    }
    UIColumnModel.prototype.getRowCount = function () {
        return this.items.length;
    };
    UIColumnModel.prototype.getRow = function (index) {
        return this.items[index];
    };
    return UIColumnModel;
}());
var PRIMARY_COLS_LIST_PANEL_CLASS = 'ag-column-select-list';
var PrimaryColsListPanel = /** @class */ (function (_super) {
    __extends$3(PrimaryColsListPanel, _super);
    function PrimaryColsListPanel() {
        var _this = _super.call(this, PrimaryColsListPanel.TEMPLATE) || this;
        _this.destroyColumnItemFuncs = [];
        return _this;
    }
    PrimaryColsListPanel.prototype.destroyColumnTree = function () {
        this.allColsTree = [];
        this.destroyColumnItemFuncs.forEach(function (f) { return f(); });
        this.destroyColumnItemFuncs = [];
    };
    PrimaryColsListPanel.prototype.init = function (params, allowDragging, eventType) {
        var _this = this;
        this.params = params;
        this.allowDragging = allowDragging;
        this.eventType = eventType;
        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
        }
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnsChanged.bind(this));
        var eventsImpactingCheckedState = [
            core.Events.EVENT_COLUMN_PIVOT_CHANGED,
            core.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            core.Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            core.Events.EVENT_COLUMN_VALUE_CHANGED,
            core.Events.EVENT_COLUMN_VISIBLE,
            core.Events.EVENT_NEW_COLUMNS_LOADED
        ];
        eventsImpactingCheckedState.forEach(function (event) {
            // update header select all checkbox with current selection state
            _this.addManagedListener(_this.eventService, event, _this.fireSelectionChangedEvent.bind(_this));
        });
        this.expandGroupsByDefault = !this.params.contractColumnSelection;
        var translate = this.localeService.getLocaleTextFunc();
        var columnListName = translate('ariaColumnList', 'Column List');
        this.virtualList = this.createManagedBean(new core.VirtualList('column-select', 'tree', columnListName));
        this.appendChild(this.virtualList.getGui());
        this.virtualList.setComponentCreator(function (item, listItemElement) {
            core._.setAriaLevel(listItemElement, (item.getDept() + 1));
            return _this.createComponentFromItem(item, listItemElement);
        });
        if (this.columnModel.isReady()) {
            this.onColumnsChanged();
        }
        if (!params.suppressColumnMove && !this.gridOptionsService.is('suppressMovableColumns')) {
            this.createManagedBean(new PrimaryColsListPanelItemDragFeature(this, this.virtualList));
        }
    };
    PrimaryColsListPanel.prototype.createComponentFromItem = function (item, listItemElement) {
        if (item.isGroup()) {
            var renderedGroup = new ToolPanelColumnGroupComp(item, this.allowDragging, this.eventType, listItemElement);
            this.getContext().createBean(renderedGroup);
            return renderedGroup;
        }
        var columnComp = new ToolPanelColumnComp(item.getColumn(), item.getDept(), this.allowDragging, this.groupsExist, listItemElement);
        this.getContext().createBean(columnComp);
        return columnComp;
    };
    PrimaryColsListPanel.prototype.onColumnsChanged = function () {
        var expandedStates = this.getExpandedStates();
        var pivotModeActive = this.columnModel.isPivotMode();
        var shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        if (shouldSyncColumnLayoutWithGrid) {
            this.buildTreeFromWhatGridIsDisplaying();
        }
        else {
            this.buildTreeFromProvidedColumnDefs();
        }
        this.setExpandedStates(expandedStates);
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    };
    PrimaryColsListPanel.prototype.getDisplayedColsList = function () {
        return this.displayedColsList;
    };
    PrimaryColsListPanel.prototype.getExpandedStates = function () {
        if (!this.allColsTree) {
            return {};
        }
        var res = {};
        this.forEachItem(function (item) {
            if (!item.isGroup()) {
                return;
            }
            var colGroup = item.getColumnGroup();
            if (colGroup) { // group should always exist, this is defensive
                res[colGroup.getId()] = item.isExpanded();
            }
        });
        return res;
    };
    PrimaryColsListPanel.prototype.setExpandedStates = function (states) {
        if (!this.allColsTree) {
            return;
        }
        this.forEachItem(function (item) {
            if (!item.isGroup()) {
                return;
            }
            var colGroup = item.getColumnGroup();
            if (colGroup) { // group should always exist, this is defensive
                var expanded = states[colGroup.getId()];
                var groupExistedLastTime = expanded != null;
                if (groupExistedLastTime) {
                    item.setExpanded(expanded);
                }
            }
        });
    };
    PrimaryColsListPanel.prototype.buildTreeFromWhatGridIsDisplaying = function () {
        this.colDefService.syncLayoutWithGrid(this.setColumnLayout.bind(this));
    };
    PrimaryColsListPanel.prototype.setColumnLayout = function (colDefs) {
        var columnTree = this.colDefService.createColumnTree(colDefs);
        this.buildListModel(columnTree);
        // using col defs to check if groups exist as it could be a custom layout
        this.groupsExist = colDefs.some(function (colDef) {
            return colDef && typeof colDef.children !== 'undefined';
        });
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    };
    PrimaryColsListPanel.prototype.buildTreeFromProvidedColumnDefs = function () {
        // add column / group comps to tool panel
        this.buildListModel(this.columnModel.getPrimaryColumnTree());
        this.groupsExist = this.columnModel.isPrimaryColumnGroupsPresent();
    };
    PrimaryColsListPanel.prototype.buildListModel = function (columnTree) {
        var _this = this;
        var columnExpandedListener = this.onColumnExpanded.bind(this);
        var addListeners = function (item) {
            item.addEventListener(ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            var removeFunc = item.removeEventListener.bind(item, ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            _this.destroyColumnItemFuncs.push(removeFunc);
        };
        var recursivelyBuild = function (tree, dept, parentList) {
            tree.forEach(function (child) {
                if (child instanceof core.ProvidedColumnGroup) {
                    createGroupItem(child, dept, parentList);
                }
                else {
                    createColumnItem(child, dept, parentList);
                }
            });
        };
        var createGroupItem = function (columnGroup, dept, parentList) {
            var columnGroupDef = columnGroup.getColGroupDef();
            var skipThisGroup = columnGroupDef && columnGroupDef.suppressColumnsToolPanel;
            if (skipThisGroup) {
                return;
            }
            if (columnGroup.isPadding()) {
                recursivelyBuild(columnGroup.getChildren(), dept, parentList);
                return;
            }
            var displayName = _this.columnModel.getDisplayNameForProvidedColumnGroup(null, columnGroup, _this.eventType);
            var item = new ColumnModelItem(displayName, columnGroup, dept, true, _this.expandGroupsByDefault);
            parentList.push(item);
            addListeners(item);
            recursivelyBuild(columnGroup.getChildren(), dept + 1, item.getChildren());
        };
        var createColumnItem = function (column, dept, parentList) {
            var skipThisColumn = column.getColDef() && column.getColDef().suppressColumnsToolPanel;
            if (skipThisColumn) {
                return;
            }
            var displayName = _this.columnModel.getDisplayNameForColumn(column, 'columnToolPanel');
            parentList.push(new ColumnModelItem(displayName, column, dept));
        };
        this.destroyColumnTree();
        recursivelyBuild(columnTree, 0, this.allColsTree);
    };
    PrimaryColsListPanel.prototype.onColumnExpanded = function () {
        this.flattenAndFilterModel();
    };
    PrimaryColsListPanel.prototype.flattenAndFilterModel = function () {
        var _this = this;
        this.displayedColsList = [];
        var recursiveFunc = function (item) {
            if (!item.isPassesFilter()) {
                return;
            }
            _this.displayedColsList.push(item);
            if (item.isGroup() && item.isExpanded()) {
                item.getChildren().forEach(recursiveFunc);
            }
        };
        this.allColsTree.forEach(recursiveFunc);
        this.virtualList.setModel(new UIColumnModel(this.displayedColsList));
        var focusedRow = this.virtualList.getLastFocusedRow();
        this.virtualList.refresh();
        if (focusedRow != null) {
            this.focusRowIfAlive(focusedRow);
        }
        this.notifyListeners();
    };
    PrimaryColsListPanel.prototype.focusRowIfAlive = function (rowIndex) {
        var _this = this;
        window.setTimeout(function () {
            if (_this.isAlive()) {
                _this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    };
    PrimaryColsListPanel.prototype.forEachItem = function (callback) {
        var recursiveFunc = function (items) {
            items.forEach(function (item) {
                callback(item);
                if (item.isGroup()) {
                    recursiveFunc(item.getChildren());
                }
            });
        };
        recursiveFunc(this.allColsTree);
    };
    PrimaryColsListPanel.prototype.doSetExpandedAll = function (value) {
        this.forEachItem(function (item) {
            if (item.isGroup()) {
                item.setExpanded(value);
            }
        });
    };
    PrimaryColsListPanel.prototype.setGroupsExpanded = function (expand, groupIds) {
        if (!groupIds) {
            this.doSetExpandedAll(expand);
            return;
        }
        var expandedGroupIds = [];
        this.forEachItem(function (item) {
            if (!item.isGroup()) {
                return;
            }
            var groupId = item.getColumnGroup().getId();
            if (groupIds.indexOf(groupId) >= 0) {
                item.setExpanded(expand);
                expandedGroupIds.push(groupId);
            }
        });
        var unrecognisedGroupIds = groupIds.filter(function (groupId) { return !core._.includes(expandedGroupIds, groupId); });
        if (unrecognisedGroupIds.length > 0) {
            console.warn('AG Grid: unable to find group(s) for supplied groupIds:', unrecognisedGroupIds);
        }
    };
    PrimaryColsListPanel.prototype.getExpandState = function () {
        var expandedCount = 0;
        var notExpandedCount = 0;
        this.forEachItem(function (item) {
            if (!item.isGroup()) {
                return;
            }
            if (item.isExpanded()) {
                expandedCount++;
            }
            else {
                notExpandedCount++;
            }
        });
        if (expandedCount > 0 && notExpandedCount > 0) {
            return ExpandState.INDETERMINATE;
        }
        if (notExpandedCount > 0) {
            return ExpandState.COLLAPSED;
        }
        return ExpandState.EXPANDED;
    };
    PrimaryColsListPanel.prototype.doSetSelectedAll = function (selectAllChecked) {
        this.modelItemUtils.selectAllChildren(this.allColsTree, selectAllChecked, this.eventType);
    };
    PrimaryColsListPanel.prototype.getSelectionState = function () {
        var checkedCount = 0;
        var uncheckedCount = 0;
        var pivotMode = this.columnModel.isPivotMode();
        this.forEachItem(function (item) {
            if (item.isGroup()) {
                return;
            }
            if (!item.isPassesFilter()) {
                return;
            }
            var column = item.getColumn();
            var colDef = column.getColDef();
            var checked;
            if (pivotMode) {
                var noPivotModeOptionsAllowed = !column.isAllowPivot() && !column.isAllowRowGroup() && !column.isAllowValue();
                if (noPivotModeOptionsAllowed) {
                    return;
                }
                checked = column.isValueActive() || column.isPivotActive() || column.isRowGroupActive();
            }
            else {
                if (colDef.lockVisible) {
                    return;
                }
                checked = column.isVisible();
            }
            checked ? checkedCount++ : uncheckedCount++;
        });
        if (checkedCount > 0 && uncheckedCount > 0) {
            return undefined;
        }
        return !(checkedCount === 0 || uncheckedCount > 0);
    };
    PrimaryColsListPanel.prototype.setFilterText = function (filterText) {
        this.filterText = core._.exists(filterText) ? filterText.toLowerCase() : null;
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    };
    PrimaryColsListPanel.prototype.markFilteredColumns = function () {
        var _this = this;
        var passesFilter = function (item) {
            if (!core._.exists(_this.filterText)) {
                return true;
            }
            var displayName = item.getDisplayName();
            return displayName == null || displayName.toLowerCase().indexOf(_this.filterText) !== -1;
        };
        var recursivelyCheckFilter = function (item, parentPasses) {
            var atLeastOneChildPassed = false;
            if (item.isGroup()) {
                var groupPasses_1 = passesFilter(item);
                item.getChildren().forEach(function (child) {
                    var childPasses = recursivelyCheckFilter(child, groupPasses_1 || parentPasses);
                    if (childPasses) {
                        atLeastOneChildPassed = childPasses;
                    }
                });
            }
            var filterPasses = (parentPasses || atLeastOneChildPassed) ? true : passesFilter(item);
            item.setPassesFilter(filterPasses);
            return filterPasses;
        };
        this.allColsTree.forEach(function (item) { return recursivelyCheckFilter(item, false); });
    };
    PrimaryColsListPanel.prototype.notifyListeners = function () {
        this.fireGroupExpandedEvent();
        this.fireSelectionChangedEvent();
    };
    PrimaryColsListPanel.prototype.fireGroupExpandedEvent = function () {
        var expandState = this.getExpandState();
        this.dispatchEvent({ type: 'groupExpanded', state: expandState });
    };
    PrimaryColsListPanel.prototype.fireSelectionChangedEvent = function () {
        var selectionState = this.getSelectionState();
        this.dispatchEvent({ type: 'selectionChanged', state: selectionState });
    };
    PrimaryColsListPanel.TEMPLATE = "<div class=\"" + PRIMARY_COLS_LIST_PANEL_CLASS + "\" role=\"presentation\"></div>";
    __decorate$4([
        core.Autowired('columnModel')
    ], PrimaryColsListPanel.prototype, "columnModel", void 0);
    __decorate$4([
        core.Autowired('toolPanelColDefService')
    ], PrimaryColsListPanel.prototype, "colDefService", void 0);
    __decorate$4([
        core.Autowired('modelItemUtils')
    ], PrimaryColsListPanel.prototype, "modelItemUtils", void 0);
    __decorate$4([
        core.PreDestroy
    ], PrimaryColsListPanel.prototype, "destroyColumnTree", null);
    return PrimaryColsListPanel;
}(core.Component));

var __extends$2 = (undefined && undefined.__extends) || (function () {
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
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PivotModePanel = /** @class */ (function (_super) {
    __extends$2(PivotModePanel, _super);
    function PivotModePanel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PivotModePanel.prototype.createTemplate = function () {
        return /* html */ "<div class=\"ag-pivot-mode-panel\">\n                <ag-toggle-button ref=\"cbPivotMode\" class=\"ag-pivot-mode-select\"></ag-toggle-button>\n            </div>";
    };
    PivotModePanel.prototype.init = function () {
        this.setTemplate(this.createTemplate());
        this.cbPivotMode.setValue(this.columnModel.isPivotMode());
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        this.cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));
        this.addManagedListener(this.cbPivotMode, core.AgCheckbox.EVENT_CHANGED, this.onBtPivotMode.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, this.onPivotModeChanged.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
    };
    PivotModePanel.prototype.onBtPivotMode = function () {
        var newValue = !!this.cbPivotMode.getValue();
        if (newValue !== this.columnModel.isPivotMode()) {
            this.columnModel.setPivotMode(newValue, "toolPanelUi");
            var api = this.gridOptionsService.get('api');
            if (api) {
                api.refreshHeader();
            }
        }
    };
    PivotModePanel.prototype.onPivotModeChanged = function () {
        var pivotModeActive = this.columnModel.isPivotMode();
        this.cbPivotMode.setValue(pivotModeActive);
    };
    __decorate$3([
        core.Autowired('columnModel')
    ], PivotModePanel.prototype, "columnModel", void 0);
    __decorate$3([
        core.RefSelector('cbPivotMode')
    ], PivotModePanel.prototype, "cbPivotMode", void 0);
    __decorate$3([
        core.PreConstruct
    ], PivotModePanel.prototype, "init", null);
    return PivotModePanel;
}(core.Component));

var __extends$1 = (undefined && undefined.__extends) || (function () {
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
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrimaryColsPanel = /** @class */ (function (_super) {
    __extends$1(PrimaryColsPanel, _super);
    function PrimaryColsPanel() {
        return _super.call(this, PrimaryColsPanel.TEMPLATE) || this;
    }
    PrimaryColsPanel.prototype.postConstruct = function () {
        this.initialiseTabGuard({});
    };
    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    PrimaryColsPanel.prototype.init = function (allowDragging, params, eventType) {
        this.allowDragging = allowDragging;
        this.params = params;
        this.eventType = eventType;
        this.primaryColsHeaderPanel.init(this.params);
        var hideFilter = this.params.suppressColumnFilter;
        var hideSelect = this.params.suppressColumnSelectAll;
        var hideExpand = this.params.suppressColumnExpandAll;
        if (hideExpand && hideFilter && hideSelect) {
            this.primaryColsHeaderPanel.setDisplayed(false);
        }
        this.addManagedListener(this.primaryColsListPanel, 'groupExpanded', this.onGroupExpanded.bind(this));
        this.addManagedListener(this.primaryColsListPanel, 'selectionChanged', this.onSelectionChange.bind(this));
        this.primaryColsListPanel.init(this.params, this.allowDragging, this.eventType);
        this.addManagedListener(this.primaryColsHeaderPanel, 'expandAll', this.onExpandAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'collapseAll', this.onCollapseAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'selectAll', this.onSelectAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'unselectAll', this.onUnselectAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'filterChanged', this.onFilterChanged.bind(this));
        this.positionableFeature = new core.PositionableFeature(this.getGui(), { minHeight: 100 });
        this.createManagedBean(this.positionableFeature);
    };
    PrimaryColsPanel.prototype.toggleResizable = function (resizable) {
        this.positionableFeature.setResizable(resizable ? { bottom: true } : false);
    };
    PrimaryColsPanel.prototype.onExpandAll = function () {
        this.primaryColsListPanel.doSetExpandedAll(true);
    };
    PrimaryColsPanel.prototype.onCollapseAll = function () {
        this.primaryColsListPanel.doSetExpandedAll(false);
    };
    PrimaryColsPanel.prototype.expandGroups = function (groupIds) {
        this.primaryColsListPanel.setGroupsExpanded(true, groupIds);
    };
    PrimaryColsPanel.prototype.collapseGroups = function (groupIds) {
        this.primaryColsListPanel.setGroupsExpanded(false, groupIds);
    };
    PrimaryColsPanel.prototype.setColumnLayout = function (colDefs) {
        this.primaryColsListPanel.setColumnLayout(colDefs);
    };
    PrimaryColsPanel.prototype.onFilterChanged = function (event) {
        this.primaryColsListPanel.setFilterText(event.filterText);
    };
    PrimaryColsPanel.prototype.syncLayoutWithGrid = function () {
        this.primaryColsListPanel.onColumnsChanged();
    };
    PrimaryColsPanel.prototype.onSelectAll = function () {
        this.primaryColsListPanel.doSetSelectedAll(true);
    };
    PrimaryColsPanel.prototype.onUnselectAll = function () {
        this.primaryColsListPanel.doSetSelectedAll(false);
    };
    PrimaryColsPanel.prototype.onGroupExpanded = function (event) {
        this.primaryColsHeaderPanel.setExpandState(event.state);
    };
    PrimaryColsPanel.prototype.onSelectionChange = function (event) {
        this.primaryColsHeaderPanel.setSelectionState(event.state);
    };
    PrimaryColsPanel.TEMPLATE = "<div class=\"ag-column-select\">\n            <ag-primary-cols-header ref=\"primaryColsHeaderPanel\"></ag-primary-cols-header>\n            <ag-primary-cols-list ref=\"primaryColsListPanel\"></ag-primary-cols-list>\n        </div>";
    __decorate$2([
        core.RefSelector('primaryColsHeaderPanel')
    ], PrimaryColsPanel.prototype, "primaryColsHeaderPanel", void 0);
    __decorate$2([
        core.RefSelector('primaryColsListPanel')
    ], PrimaryColsPanel.prototype, "primaryColsListPanel", void 0);
    __decorate$2([
        core.PostConstruct
    ], PrimaryColsPanel.prototype, "postConstruct", null);
    return PrimaryColsPanel;
}(core.TabGuardComp));

var __extends = (undefined && undefined.__extends) || (function () {
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
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ColumnToolPanel = /** @class */ (function (_super) {
    __extends(ColumnToolPanel, _super);
    function ColumnToolPanel() {
        var _this = _super.call(this, ColumnToolPanel.TEMPLATE) || this;
        _this.initialised = false;
        _this.childDestroyFuncs = [];
        return _this;
    }
    // lazy initialise the panel
    ColumnToolPanel.prototype.setVisible = function (visible) {
        _super.prototype.setDisplayed.call(this, visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    };
    ColumnToolPanel.prototype.init = function (params) {
        var _this = this;
        var defaultParams = {
            suppressColumnMove: false,
            suppressColumnSelectAll: false,
            suppressColumnFilter: false,
            suppressColumnExpandAll: false,
            contractColumnSelection: false,
            suppressPivotMode: false,
            suppressRowGroups: false,
            suppressValues: false,
            suppressPivots: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi,
        };
        this.params = __assign(__assign(__assign({}, defaultParams), params), { context: this.gridOptionsService.get('context') });
        if (this.isRowGroupingModuleLoaded() && !this.params.suppressPivotMode) {
            // DO NOT CHANGE TO createManagedBean
            this.pivotModePanel = this.createBean(new PivotModePanel());
            this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.pivotModePanel); });
            this.appendChild(this.pivotModePanel);
        }
        // DO NOT CHANGE TO createManagedBean
        this.primaryColsPanel = this.createBean(new PrimaryColsPanel());
        this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.primaryColsPanel); });
        this.primaryColsPanel.init(true, this.params, "toolPanelUi");
        this.primaryColsPanel.addCssClass('ag-column-panel-column-select');
        this.appendChild(this.primaryColsPanel);
        if (this.isRowGroupingModuleLoaded()) {
            if (!this.params.suppressRowGroups) {
                // DO NOT CHANGE TO createManagedBean
                this.rowGroupDropZonePanel = this.createBean(new rowGrouping.RowGroupDropZonePanel(false));
                this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.rowGroupDropZonePanel); });
                this.appendChild(this.rowGroupDropZonePanel);
            }
            if (!this.params.suppressValues) {
                // DO NOT CHANGE TO createManagedBean
                this.valuesDropZonePanel = this.createBean(new rowGrouping.ValuesDropZonePanel(false));
                this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.valuesDropZonePanel); });
                this.appendChild(this.valuesDropZonePanel);
            }
            if (!this.params.suppressPivots) {
                // DO NOT CHANGE TO createManagedBean
                this.pivotDropZonePanel = this.createBean(new rowGrouping.PivotDropZonePanel(false));
                this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.pivotDropZonePanel); });
                this.appendChild(this.pivotDropZonePanel);
            }
            this.setLastVisible();
            var pivotModeListener_1 = this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, function () {
                _this.resetChildrenHeight();
                _this.setLastVisible();
            });
            this.childDestroyFuncs.push(function () { return pivotModeListener_1(); });
        }
        this.initialised = true;
    };
    ColumnToolPanel.prototype.setPivotModeSectionVisible = function (visible) {
        var _this = this;
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.pivotModePanel) {
            this.pivotModePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.pivotModePanel = this.createBean(new PivotModePanel());
            // ensure pivot mode panel is positioned at the top of the columns tool panel
            this.getGui().insertBefore(this.pivotModePanel.getGui(), this.getGui().firstChild);
            this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.pivotModePanel); });
        }
        this.setLastVisible();
    };
    ColumnToolPanel.prototype.setRowGroupsSectionVisible = function (visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.rowGroupDropZonePanel) {
            this.rowGroupDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.rowGroupDropZonePanel = this.createManagedBean(new rowGrouping.RowGroupDropZonePanel(false));
            this.appendChild(this.rowGroupDropZonePanel);
        }
        this.setLastVisible();
    };
    ColumnToolPanel.prototype.setValuesSectionVisible = function (visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.valuesDropZonePanel) {
            this.valuesDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.valuesDropZonePanel = this.createManagedBean(new rowGrouping.ValuesDropZonePanel(false));
            this.appendChild(this.valuesDropZonePanel);
        }
        this.setLastVisible();
    };
    ColumnToolPanel.prototype.setPivotSectionVisible = function (visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.pivotDropZonePanel) {
            this.pivotDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.pivotDropZonePanel = this.createManagedBean(new rowGrouping.PivotDropZonePanel(false));
            this.appendChild(this.pivotDropZonePanel);
            this.pivotDropZonePanel.setDisplayed(visible);
        }
        this.setLastVisible();
    };
    ColumnToolPanel.prototype.setResizers = function () {
        [
            this.primaryColsPanel,
            this.rowGroupDropZonePanel,
            this.valuesDropZonePanel,
            this.pivotDropZonePanel
        ].forEach(function (panel) {
            if (!panel) {
                return;
            }
            var eGui = panel.getGui();
            panel.toggleResizable(!eGui.classList.contains('ag-last-column-drop') && !eGui.classList.contains('ag-hidden'));
        });
    };
    ColumnToolPanel.prototype.setLastVisible = function () {
        var eGui = this.getGui();
        var columnDrops = Array.prototype.slice.call(eGui.querySelectorAll('.ag-column-drop'));
        columnDrops.forEach(function (columnDrop) { return columnDrop.classList.remove('ag-last-column-drop'); });
        var columnDropEls = eGui.querySelectorAll('.ag-column-drop:not(.ag-hidden)');
        var lastVisible = core._.last(columnDropEls);
        if (lastVisible) {
            lastVisible.classList.add('ag-last-column-drop');
        }
        this.setResizers();
    };
    ColumnToolPanel.prototype.resetChildrenHeight = function () {
        var eGui = this.getGui();
        var children = eGui.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            child.style.removeProperty('height');
            child.style.removeProperty('flex');
        }
    };
    ColumnToolPanel.prototype.isRowGroupingModuleLoaded = function () {
        return core.ModuleRegistry.assertRegistered(core.ModuleNames.RowGroupingModule, 'Row Grouping');
    };
    ColumnToolPanel.prototype.expandColumnGroups = function (groupIds) {
        this.primaryColsPanel.expandGroups(groupIds);
    };
    ColumnToolPanel.prototype.collapseColumnGroups = function (groupIds) {
        this.primaryColsPanel.collapseGroups(groupIds);
    };
    ColumnToolPanel.prototype.setColumnLayout = function (colDefs) {
        this.primaryColsPanel.setColumnLayout(colDefs);
    };
    ColumnToolPanel.prototype.syncLayoutWithGrid = function () {
        this.primaryColsPanel.syncLayoutWithGrid();
    };
    ColumnToolPanel.prototype.destroyChildren = function () {
        this.childDestroyFuncs.forEach(function (func) { return func(); });
        this.childDestroyFuncs.length = 0;
        core._.clearElement(this.getGui());
    };
    ColumnToolPanel.prototype.refresh = function () {
        this.destroyChildren();
        this.init(this.params);
    };
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so this must be public.
    ColumnToolPanel.prototype.destroy = function () {
        this.destroyChildren();
        _super.prototype.destroy.call(this);
    };
    ColumnToolPanel.TEMPLATE = "<div class=\"ag-column-panel\"></div>";
    __decorate$1([
        core.Autowired("gridApi")
    ], ColumnToolPanel.prototype, "gridApi", void 0);
    __decorate$1([
        core.Autowired("columnApi")
    ], ColumnToolPanel.prototype, "columnApi", void 0);
    return ColumnToolPanel;
}(core.Component));

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ModelItemUtils = /** @class */ (function () {
    function ModelItemUtils() {
    }
    ModelItemUtils.prototype.selectAllChildren = function (colTree, selectAllChecked, eventType) {
        var cols = this.extractAllLeafColumns(colTree);
        this.setAllColumns(cols, selectAllChecked, eventType);
    };
    ModelItemUtils.prototype.setColumn = function (col, selectAllChecked, eventType) {
        this.setAllColumns([col], selectAllChecked, eventType);
    };
    ModelItemUtils.prototype.setAllColumns = function (cols, selectAllChecked, eventType) {
        if (this.columnModel.isPivotMode()) {
            this.setAllPivot(cols, selectAllChecked, eventType);
        }
        else {
            this.setAllVisible(cols, selectAllChecked, eventType);
        }
    };
    ModelItemUtils.prototype.extractAllLeafColumns = function (allItems) {
        var res = [];
        var recursiveFunc = function (items) {
            items.forEach(function (item) {
                if (!item.isPassesFilter()) {
                    return;
                }
                if (item.isGroup()) {
                    recursiveFunc(item.getChildren());
                }
                else {
                    res.push(item.getColumn());
                }
            });
        };
        recursiveFunc(allItems);
        return res;
    };
    ModelItemUtils.prototype.setAllVisible = function (columns, visible, eventType) {
        var colStateItems = [];
        columns.forEach(function (col) {
            if (col.getColDef().lockVisible) {
                return;
            }
            if (col.isVisible() != visible) {
                colStateItems.push({
                    colId: col.getId(),
                    hide: !visible
                });
            }
        });
        if (colStateItems.length > 0) {
            this.columnModel.applyColumnState({ state: colStateItems }, eventType);
        }
    };
    ModelItemUtils.prototype.setAllPivot = function (columns, value, eventType) {
        if (this.gridOptionsService.is('functionsPassive')) {
            this.setAllPivotPassive(columns, value);
        }
        else {
            this.setAllPivotActive(columns, value, eventType);
        }
    };
    ModelItemUtils.prototype.setAllPivotPassive = function (columns, value) {
        var copyOfPivotColumns = this.columnModel.getPivotColumns().slice();
        var copyOfValueColumns = this.columnModel.getValueColumns().slice();
        var copyOfRowGroupColumns = this.columnModel.getRowGroupColumns().slice();
        var pivotChanged = false;
        var valueChanged = false;
        var rowGroupChanged = false;
        var turnOnAction = function (col) {
            // don't change any column that's already got a function active
            if (col.isAnyFunctionActive()) {
                return;
            }
            if (col.isAllowValue()) {
                copyOfValueColumns.push(col);
                valueChanged = true;
            }
            else if (col.isAllowRowGroup()) {
                copyOfRowGroupColumns.push(col);
                pivotChanged = true;
            }
            else if (col.isAllowPivot()) {
                copyOfPivotColumns.push(col);
                rowGroupChanged = true;
            }
        };
        var turnOffAction = function (col) {
            if (!col.isAnyFunctionActive()) {
                return;
            }
            if (copyOfPivotColumns.indexOf(col) >= 0) {
                core._.removeFromArray(copyOfPivotColumns, col);
                pivotChanged = true;
            }
            if (copyOfValueColumns.indexOf(col) >= 0) {
                core._.removeFromArray(copyOfValueColumns, col);
                valueChanged = true;
            }
            if (copyOfRowGroupColumns.indexOf(col) >= 0) {
                core._.removeFromArray(copyOfRowGroupColumns, col);
                rowGroupChanged = true;
            }
        };
        var action = value ? turnOnAction : turnOffAction;
        columns.forEach(action);
        if (pivotChanged) {
            var event_1 = {
                type: core.Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                columns: copyOfPivotColumns
            };
            this.eventService.dispatchEvent(event_1);
        }
        if (rowGroupChanged) {
            var event_2 = {
                type: core.Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: copyOfRowGroupColumns
            };
            this.eventService.dispatchEvent(event_2);
        }
        if (valueChanged) {
            var event_3 = {
                type: core.Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: copyOfRowGroupColumns
            };
            this.eventService.dispatchEvent(event_3);
        }
    };
    ModelItemUtils.prototype.setAllPivotActive = function (columns, value, eventType) {
        var _this = this;
        var colStateItems = [];
        var turnOnAction = function (col) {
            // don't change any column that's already got a function active
            if (col.isAnyFunctionActive()) {
                return;
            }
            if (col.isAllowValue()) {
                var aggFunc = typeof col.getAggFunc() === 'string'
                    ? col.getAggFunc()
                    : _this.aggFuncService.getDefaultAggFunc(col);
                colStateItems.push({
                    colId: col.getId(),
                    aggFunc: aggFunc
                });
            }
            else if (col.isAllowRowGroup()) {
                colStateItems.push({
                    colId: col.getId(),
                    rowGroup: true
                });
            }
            else if (col.isAllowPivot()) {
                colStateItems.push({
                    colId: col.getId(),
                    pivot: true
                });
            }
        };
        var turnOffAction = function (col) {
            var isActive = col.isPivotActive() || col.isRowGroupActive() || col.isValueActive();
            if (isActive) {
                colStateItems.push({
                    colId: col.getId(),
                    pivot: false,
                    rowGroup: false,
                    aggFunc: null
                });
            }
        };
        var action = value ? turnOnAction : turnOffAction;
        columns.forEach(action);
        if (colStateItems.length > 0) {
            this.columnModel.applyColumnState({ state: colStateItems }, eventType);
        }
    };
    __decorate([
        core.Autowired('aggFuncService')
    ], ModelItemUtils.prototype, "aggFuncService", void 0);
    __decorate([
        core.Autowired('columnModel')
    ], ModelItemUtils.prototype, "columnModel", void 0);
    __decorate([
        core.Autowired('gridOptionsService')
    ], ModelItemUtils.prototype, "gridOptionsService", void 0);
    __decorate([
        core.Autowired('eventService')
    ], ModelItemUtils.prototype, "eventService", void 0);
    ModelItemUtils = __decorate([
        core.Bean('modelItemUtils')
    ], ModelItemUtils);
    return ModelItemUtils;
}());

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '29.0.0';

var ColumnsToolPanelModule = {
    version: VERSION,
    moduleName: core.ModuleNames.ColumnToolPanelModule,
    beans: [ModelItemUtils],
    agStackComponents: [
        { componentName: 'AgPrimaryColsHeader', componentClass: PrimaryColsHeaderPanel },
        { componentName: 'AgPrimaryColsList', componentClass: PrimaryColsListPanel },
        { componentName: 'AgPrimaryCols', componentClass: PrimaryColsPanel }
    ],
    userComponents: [
        { componentName: 'agColumnsToolPanel', componentClass: ColumnToolPanel },
    ],
    dependantModules: [
        core$1.EnterpriseCoreModule,
        rowGrouping.RowGroupingModule,
        sideBar.SideBarModule
    ]
};

exports.ColumnsToolPanelModule = ColumnsToolPanelModule;
exports.PrimaryColsPanel = PrimaryColsPanel;
