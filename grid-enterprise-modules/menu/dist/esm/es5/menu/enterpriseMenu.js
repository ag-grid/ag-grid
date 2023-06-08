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
import { _, Autowired, Bean, BeanStub, ModuleNames, ModuleRegistry, PostConstruct, AgPromise, TabbedLayout, AgMenuList, AgMenuItemComponent } from '@ag-grid-community/core';
import { PrimaryColsPanel } from '@ag-grid-enterprise/column-tool-panel';
var EnterpriseMenuFactory = /** @class */ (function (_super) {
    __extends(EnterpriseMenuFactory, _super);
    function EnterpriseMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnterpriseMenuFactory.prototype.hideActiveMenu = function () {
        this.destroyBean(this.activeMenu);
    };
    EnterpriseMenuFactory.prototype.showMenuAfterMouseEvent = function (column, mouseEvent, defaultTab) {
        var _this = this;
        this.showMenu(column, function (menu) {
            var ePopup = menu.getGui();
            _this.popupService.positionPopupUnderMouseEvent({
                type: 'columnMenu',
                column: column,
                mouseEvent: mouseEvent,
                ePopup: ePopup
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, 'columnMenu', defaultTab, undefined, mouseEvent.target);
    };
    EnterpriseMenuFactory.prototype.showMenuAfterButtonClick = function (column, eventSource, containerType, defaultTab, restrictToTabs) {
        var _this = this;
        var multiplier = -1;
        var alignSide = 'left';
        if (this.gridOptionsService.is('enableRtl')) {
            multiplier = 1;
            alignSide = 'right';
        }
        this.showMenu(column, function (menu) {
            var ePopup = menu.getGui();
            _this.popupService.positionPopupByComponent({
                type: containerType,
                column: column,
                eventSource: eventSource,
                ePopup: ePopup,
                alignSide: alignSide,
                nudgeX: 9 * multiplier,
                nudgeY: -23,
                position: 'under',
                keepWithinBounds: true,
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, containerType, defaultTab, restrictToTabs, eventSource);
    };
    EnterpriseMenuFactory.prototype.showMenu = function (column, positionCallback, containerType, defaultTab, restrictToTabs, eventSource) {
        var _this = this;
        var _a = this.getMenuParams(column, restrictToTabs, eventSource), menu = _a.menu, eMenuGui = _a.eMenuGui, currentHeaderPosition = _a.currentHeaderPosition, currentColumnIndex = _a.currentColumnIndex, anchorToElement = _a.anchorToElement;
        var closedFuncs = [];
        closedFuncs.push(this.getClosedCallback(column, menu, currentHeaderPosition, currentColumnIndex, eventSource));
        var translate = this.localeService.getLocaleTextFunc();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: function (e) {
                closedFuncs.forEach(function (f) { return f(e); });
            },
            afterGuiAttached: function (params) { return menu.afterGuiAttached(Object.assign({}, { container: containerType }, params)); },
            // if defaultTab is not present, positionCallback will be called
            // after `showTabBasedOnPreviousSelection` is called.
            positionCallback: !!defaultTab ? function () { return positionCallback(menu); } : undefined,
            ariaLabel: translate('ariaLabelColumnMenu', 'Column Menu')
        });
        if (!defaultTab) {
            menu.showTabBasedOnPreviousSelection();
            // reposition the menu because the method above could load
            // an element that is bigger than enterpriseMenu header.
            positionCallback(menu);
        }
        // if user starts showing / hiding columns, or otherwise move the underlying column
        // for this menu, we want to stop tracking the menu with the column position. otherwise
        // the menu would move as the user is using the columns tab inside the menu.
        var stopAnchoringPromise = this.popupService.setPopupPositionRelatedToElement(eMenuGui, anchorToElement);
        if (stopAnchoringPromise) {
            this.addStopAnchoring(stopAnchoringPromise, column, closedFuncs);
        }
        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, function (event) {
            _this.lastSelectedTab = event.key;
        });
        column.setMenuVisible(true, 'contextMenu');
        this.activeMenu = menu;
        menu.addEventListener(BeanStub.EVENT_DESTROYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
    };
    EnterpriseMenuFactory.prototype.addStopAnchoring = function (stopAnchoringPromise, column, closedFuncsArr) {
        stopAnchoringPromise.then(function (stopAnchoringFunc) {
            column.addEventListener('leftChanged', stopAnchoringFunc);
            column.addEventListener('visibleChanged', stopAnchoringFunc);
            closedFuncsArr.push(function () {
                column.removeEventListener('leftChanged', stopAnchoringFunc);
                column.removeEventListener('visibleChanged', stopAnchoringFunc);
            });
        });
    };
    EnterpriseMenuFactory.prototype.getClosedCallback = function (column, menu, headerPosition, columnIndex, eventSource) {
        var _this = this;
        return function (e) {
            _this.destroyBean(menu);
            column.setMenuVisible(false, 'contextMenu');
            var isKeyboardEvent = e instanceof KeyboardEvent;
            if (!isKeyboardEvent || !eventSource) {
                return;
            }
            if (_.isVisible(eventSource)) {
                var focusableEl = _this.focusService.findTabbableParent(eventSource);
                if (focusableEl) {
                    if (column) {
                        _this.headerNavigationService.scrollToColumn(column);
                    }
                    focusableEl.focus();
                }
            }
            // if the focusEl is no longer in the DOM, we try to focus
            // the header that is closest to the previous header position
            else if (headerPosition && columnIndex !== -1) {
                var allColumns = _this.columnModel.getAllDisplayedColumns();
                var columnToFocus = allColumns[columnIndex] || _.last(allColumns);
                if (columnToFocus) {
                    _this.focusService.focusHeaderPosition({
                        headerPosition: {
                            headerRowIndex: headerPosition.headerRowIndex,
                            column: columnToFocus
                        }
                    });
                }
            }
        };
    };
    EnterpriseMenuFactory.prototype.getMenuParams = function (column, restrictToTabs, eventSource) {
        var menu = this.createBean(new EnterpriseMenu(column, this.lastSelectedTab, restrictToTabs));
        return {
            menu: menu,
            eMenuGui: menu.getGui(),
            currentHeaderPosition: this.focusService.getFocusedHeader(),
            currentColumnIndex: this.columnModel.getAllDisplayedColumns().indexOf(column),
            anchorToElement: eventSource || this.ctrlsService.getGridBodyCtrl().getGui()
        };
    };
    EnterpriseMenuFactory.prototype.isMenuEnabled = function (column) {
        return column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT).length > 0;
    };
    __decorate([
        Autowired('popupService')
    ], EnterpriseMenuFactory.prototype, "popupService", void 0);
    __decorate([
        Autowired('focusService')
    ], EnterpriseMenuFactory.prototype, "focusService", void 0);
    __decorate([
        Autowired('headerNavigationService')
    ], EnterpriseMenuFactory.prototype, "headerNavigationService", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], EnterpriseMenuFactory.prototype, "ctrlsService", void 0);
    __decorate([
        Autowired('columnModel')
    ], EnterpriseMenuFactory.prototype, "columnModel", void 0);
    EnterpriseMenuFactory = __decorate([
        Bean('menuFactory')
    ], EnterpriseMenuFactory);
    return EnterpriseMenuFactory;
}(BeanStub));
export { EnterpriseMenuFactory };
var EnterpriseMenu = /** @class */ (function (_super) {
    __extends(EnterpriseMenu, _super);
    function EnterpriseMenu(column, initialSelection, restrictTo) {
        var _this = _super.call(this) || this;
        _this.tabFactories = {};
        _this.includeChecks = {};
        _this.column = column;
        _this.initialSelection = initialSelection;
        _this.tabFactories[EnterpriseMenu.TAB_GENERAL] = _this.createMainPanel.bind(_this);
        _this.tabFactories[EnterpriseMenu.TAB_FILTER] = _this.createFilterPanel.bind(_this);
        _this.tabFactories[EnterpriseMenu.TAB_COLUMNS] = _this.createColumnsPanel.bind(_this);
        _this.includeChecks[EnterpriseMenu.TAB_GENERAL] = function () { return true; };
        _this.includeChecks[EnterpriseMenu.TAB_FILTER] = function () { return _this.filterManager.isFilterAllowed(column); };
        _this.includeChecks[EnterpriseMenu.TAB_COLUMNS] = function () { return true; };
        _this.restrictTo = restrictTo;
        return _this;
    }
    EnterpriseMenu.prototype.init = function () {
        var _this = this;
        var tabs = this.getTabsToCreate().map(function (name) { return _this.createTab(name); });
        this.tabbedLayout = new TabbedLayout({
            items: tabs,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });
        this.createBean(this.tabbedLayout);
        if (this.mainMenuList) {
            this.mainMenuList.setParentComponent(this.tabbedLayout);
        }
        this.addDestroyFunc(function () { return _this.destroyBean(_this.tabbedLayout); });
    };
    EnterpriseMenu.prototype.getTabsToCreate = function () {
        var _this = this;
        if (this.restrictTo) {
            return this.restrictTo;
        }
        return this.column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT)
            .filter(function (tabName) { return _this.isValidMenuTabItem(tabName); })
            .filter(function (tabName) { return _this.isNotSuppressed(tabName); })
            .filter(function (tabName) { return _this.isModuleLoaded(tabName); });
    };
    EnterpriseMenu.prototype.isModuleLoaded = function (menuTabName) {
        if (menuTabName === EnterpriseMenu.TAB_COLUMNS) {
            return ModuleRegistry.isRegistered(ModuleNames.ColumnsToolPanelModule, this.context.getGridId());
        }
        return true;
    };
    EnterpriseMenu.prototype.isValidMenuTabItem = function (menuTabName) {
        var isValid = true;
        var itemsToConsider = EnterpriseMenu.TABS_DEFAULT;
        if (this.restrictTo != null) {
            isValid = this.restrictTo.indexOf(menuTabName) > -1;
            itemsToConsider = this.restrictTo;
        }
        isValid = isValid && EnterpriseMenu.TABS_DEFAULT.indexOf(menuTabName) > -1;
        if (!isValid) {
            console.warn("AG Grid: Trying to render an invalid menu item '" + menuTabName + "'. Check that your 'menuTabs' contains one of [" + itemsToConsider + "]");
        }
        return isValid;
    };
    EnterpriseMenu.prototype.isNotSuppressed = function (menuTabName) {
        return this.includeChecks[menuTabName]();
    };
    EnterpriseMenu.prototype.createTab = function (name) {
        return this.tabFactories[name]();
    };
    EnterpriseMenu.prototype.showTabBasedOnPreviousSelection = function () {
        // show the tab the user was on last time they had a menu open
        this.showTab(this.initialSelection);
    };
    EnterpriseMenu.prototype.showTab = function (toShow) {
        if (this.tabItemColumns && toShow === EnterpriseMenu.TAB_COLUMNS) {
            this.tabbedLayout.showItem(this.tabItemColumns);
        }
        else if (this.tabItemFilter && toShow === EnterpriseMenu.TAB_FILTER) {
            this.tabbedLayout.showItem(this.tabItemFilter);
        }
        else if (this.tabItemGeneral && toShow === EnterpriseMenu.TAB_GENERAL) {
            this.tabbedLayout.showItem(this.tabItemGeneral);
        }
        else {
            this.tabbedLayout.showFirstItem();
        }
    };
    EnterpriseMenu.prototype.onTabItemClicked = function (event) {
        var key = null;
        switch (event.item) {
            case this.tabItemColumns:
                key = EnterpriseMenu.TAB_COLUMNS;
                break;
            case this.tabItemFilter:
                key = EnterpriseMenu.TAB_FILTER;
                break;
            case this.tabItemGeneral:
                key = EnterpriseMenu.TAB_GENERAL;
                break;
        }
        if (key) {
            this.activateTab(key);
        }
    };
    EnterpriseMenu.prototype.activateTab = function (tab) {
        var ev = {
            type: EnterpriseMenu.EVENT_TAB_SELECTED,
            key: tab
        };
        this.dispatchEvent(ev);
    };
    EnterpriseMenu.prototype.getMenuItems = function () {
        var defaultMenuOptions = this.getDefaultMenuOptions();
        var result;
        var userFunc = this.gridOptionsService.getCallback('getMainMenuItems');
        if (userFunc) {
            result = userFunc({
                column: this.column,
                defaultItems: defaultMenuOptions
            });
        }
        else {
            result = defaultMenuOptions;
        }
        // GUI looks weird when two separators are side by side. this can happen accidentally
        // if we remove items from the menu then two separators can edit up adjacent.
        _.removeRepeatsFromArray(result, EnterpriseMenu.MENU_ITEM_SEPARATOR);
        return result;
    };
    EnterpriseMenu.prototype.getDefaultMenuOptions = function () {
        var result = [];
        var allowPinning = !this.column.getColDef().lockPinned;
        var rowGroupCount = this.columnModel.getRowGroupColumns().length;
        var doingGrouping = rowGroupCount > 0;
        var groupedByThisColumn = this.columnModel.getRowGroupColumns().indexOf(this.column) >= 0;
        var allowValue = this.column.isAllowValue();
        var allowRowGroup = this.column.isAllowRowGroup();
        var isPrimary = this.column.isPrimary();
        var pivotModeOn = this.columnModel.isPivotMode();
        var isInMemoryRowModel = this.rowModel.getType() === 'clientSide';
        var usingTreeData = this.gridOptionsService.isTreeData();
        var allowValueAgg = 
        // if primary, then only allow aggValue if grouping and it's a value columns
        (isPrimary && doingGrouping && allowValue)
            // secondary columns can always have aggValue, as it means it's a pivot value column
            || !isPrimary;
        if (allowPinning) {
            result.push('pinSubMenu');
        }
        if (allowValueAgg) {
            result.push('valueAggSubMenu');
        }
        if (allowPinning || allowValueAgg) {
            result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        }
        result.push('autoSizeThis');
        result.push('autoSizeAll');
        result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        if (allowRowGroup && this.column.isPrimary()) {
            if (groupedByThisColumn) {
                result.push('rowUnGroup');
            }
            else {
                result.push('rowGroup');
            }
        }
        result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        result.push('resetColumns');
        // only add grouping expand/collapse if grouping in the InMemoryRowModel
        // if pivoting, we only have expandable groups if grouping by 2 or more columns
        // as the lowest level group is not expandable while pivoting.
        // if not pivoting, then any active row group can be expanded.
        var allowExpandAndContract = isInMemoryRowModel && (usingTreeData || rowGroupCount > (pivotModeOn ? 1 : 0));
        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }
        return result;
    };
    EnterpriseMenu.prototype.createMainPanel = function () {
        this.mainMenuList = this.createManagedBean(new AgMenuList());
        var menuItems = this.getMenuItems();
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, this.column);
        this.mainMenuList.addMenuItems(menuItemsMapped);
        this.mainMenuList.addEventListener(AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: _.createIconNoSpan('menu', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_GENERAL.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(this.mainMenuList.getGui()),
            name: EnterpriseMenu.TAB_GENERAL
        };
        return this.tabItemGeneral;
    };
    EnterpriseMenu.prototype.onHidePopup = function (event) {
        var keyboardEvent;
        if (event && event.event && event.event instanceof KeyboardEvent) {
            keyboardEvent = event.event;
        }
        this.hidePopupFunc(keyboardEvent && { keyboardEvent: keyboardEvent });
        // this method only gets called when the menu was closed by selection an option
        // in this case we highlight the cell that was previously highlighted
        var focusedCell = this.focusService.getFocusedCell();
        var eDocument = this.gridOptionsService.getDocument();
        if (eDocument.activeElement === eDocument.body && focusedCell) {
            var rowIndex = focusedCell.rowIndex, rowPinned = focusedCell.rowPinned, column = focusedCell.column;
            this.focusService.setFocusedCell({ rowIndex: rowIndex, column: column, rowPinned: rowPinned, forceBrowserFocus: true, preventScrollOnBrowserFocus: true });
        }
    };
    EnterpriseMenu.prototype.createFilterPanel = function () {
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column, 'COLUMN_MENU');
        if (!filterWrapper) {
            throw new Error('AG Grid - Unable to instantiate filter');
        }
        var afterFilterAttachedCallback = function (params) {
            if (!(filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise)) {
                return;
            }
            // slightly odd block this - this promise will always have been resolved by the time it gets here, so won't be
            // async (_unless_ in react or similar, but if so why not encountered before now?).
            // I'd suggest a future improvement would be to remove/replace this promise as this block just wont work if it is
            // async and is confusing if you don't have this context
            filterWrapper.filterPromise.then(function (filter) {
                if (filter && filter.afterGuiAttached) {
                    filter.afterGuiAttached(params);
                }
            });
        };
        // see comment above
        var afterDetachedCallback = function () { var _a; return (_a = filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise) === null || _a === void 0 ? void 0 : _a.then(function (filter) { var _a; return (_a = filter === null || filter === void 0 ? void 0 : filter.afterGuiDetached) === null || _a === void 0 ? void 0 : _a.call(filter); }); };
        this.tabItemFilter = {
            title: _.createIconNoSpan('filter', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_FILTER.replace('MenuTab', ''),
            bodyPromise: filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.guiPromise,
            afterAttachedCallback: afterFilterAttachedCallback,
            afterDetachedCallback: afterDetachedCallback,
            name: EnterpriseMenu.TAB_FILTER
        };
        return this.tabItemFilter;
    };
    EnterpriseMenu.prototype.createColumnsPanel = function () {
        var eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-menu-column-select-wrapper');
        var columnSelectPanel = this.createManagedBean(new PrimaryColsPanel());
        var columnsMenuParams = this.column.getColDef().columnsMenuParams;
        if (!columnsMenuParams) {
            columnsMenuParams = {};
        }
        var contractColumnSelection = columnsMenuParams.contractColumnSelection, suppressColumnExpandAll = columnsMenuParams.suppressColumnExpandAll, suppressColumnFilter = columnsMenuParams.suppressColumnFilter, suppressColumnSelectAll = columnsMenuParams.suppressColumnSelectAll, suppressSyncLayoutWithGrid = columnsMenuParams.suppressSyncLayoutWithGrid, columnLayout = columnsMenuParams.columnLayout;
        columnSelectPanel.init(false, {
            suppressColumnMove: false,
            suppressValues: false,
            suppressPivots: false,
            suppressRowGroups: false,
            suppressPivotMode: false,
            contractColumnSelection: !!contractColumnSelection,
            suppressColumnExpandAll: !!suppressColumnExpandAll,
            suppressColumnFilter: !!suppressColumnFilter,
            suppressColumnSelectAll: !!suppressColumnSelectAll,
            suppressSyncLayoutWithGrid: !!columnLayout || !!suppressSyncLayoutWithGrid,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        }, 'columnMenu');
        if (columnLayout) {
            columnSelectPanel.setColumnLayout(columnLayout);
        }
        var columnSelectPanelGui = columnSelectPanel.getGui();
        columnSelectPanelGui.classList.add('ag-menu-column-select');
        eWrapperDiv.appendChild(columnSelectPanelGui);
        this.tabItemColumns = {
            title: _.createIconNoSpan('columns', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_COLUMNS.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(eWrapperDiv),
            name: EnterpriseMenu.TAB_COLUMNS
        };
        return this.tabItemColumns;
    };
    EnterpriseMenu.prototype.afterGuiAttached = function (params) {
        var container = params.container, hidePopup = params.hidePopup;
        this.tabbedLayout.setAfterAttachedParams({ container: container, hidePopup: hidePopup });
        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
    };
    EnterpriseMenu.prototype.getGui = function () {
        return this.tabbedLayout.getGui();
    };
    EnterpriseMenu.EVENT_TAB_SELECTED = 'tabSelected';
    EnterpriseMenu.TAB_FILTER = 'filterMenuTab';
    EnterpriseMenu.TAB_GENERAL = 'generalMenuTab';
    EnterpriseMenu.TAB_COLUMNS = 'columnsMenuTab';
    EnterpriseMenu.TABS_DEFAULT = [EnterpriseMenu.TAB_GENERAL, EnterpriseMenu.TAB_FILTER, EnterpriseMenu.TAB_COLUMNS];
    EnterpriseMenu.MENU_ITEM_SEPARATOR = 'separator';
    __decorate([
        Autowired('columnModel')
    ], EnterpriseMenu.prototype, "columnModel", void 0);
    __decorate([
        Autowired('filterManager')
    ], EnterpriseMenu.prototype, "filterManager", void 0);
    __decorate([
        Autowired('gridApi')
    ], EnterpriseMenu.prototype, "gridApi", void 0);
    __decorate([
        Autowired('columnApi')
    ], EnterpriseMenu.prototype, "columnApi", void 0);
    __decorate([
        Autowired('menuItemMapper')
    ], EnterpriseMenu.prototype, "menuItemMapper", void 0);
    __decorate([
        Autowired('rowModel')
    ], EnterpriseMenu.prototype, "rowModel", void 0);
    __decorate([
        Autowired('focusService')
    ], EnterpriseMenu.prototype, "focusService", void 0);
    __decorate([
        PostConstruct
    ], EnterpriseMenu.prototype, "init", null);
    return EnterpriseMenu;
}(BeanStub));
export { EnterpriseMenu };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50ZXJwcmlzZU1lbnUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWVudS9lbnRlcnByaXNlTWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUVELFNBQVMsRUFDVCxJQUFJLEVBQ0osUUFBUSxFQVdSLFdBQVcsRUFDWCxjQUFjLEVBRWQsYUFBYSxFQUNiLFNBQVMsRUFFVCxZQUFZLEVBS1osVUFBVSxFQUNWLG1CQUFtQixFQUt0QixNQUFNLHlCQUF5QixDQUFDO0FBR2pDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBT3pFO0lBQTJDLHlDQUFRO0lBQW5EOztJQXlNQSxDQUFDO0lBOUxVLDhDQUFjLEdBQXJCO1FBQ0ksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVNLHVEQUF1QixHQUE5QixVQUErQixNQUFjLEVBQUUsVUFBc0IsRUFBRSxVQUFtQjtRQUExRixpQkFlQztRQWRHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBb0I7WUFDdkMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRTdCLEtBQUksQ0FBQyxZQUFZLENBQUMsNEJBQTRCLENBQUM7Z0JBQzNDLElBQUksRUFBRSxZQUFZO2dCQUNsQixNQUFNLFFBQUE7Z0JBQ04sVUFBVSxZQUFBO2dCQUNWLE1BQU0sUUFBQTthQUNULENBQUMsQ0FBQztZQUVILElBQUksVUFBVSxFQUFFO2dCQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDNUI7UUFDTCxDQUFDLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLE1BQXFCLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRU0sd0RBQXdCLEdB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