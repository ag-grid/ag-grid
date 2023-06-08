/**
          * @ag-grid-enterprise/menu - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
import { Autowired, Bean, PostConstruct, BeanStub, _, TabbedLayout, ModuleRegistry, ModuleNames, AgMenuList, AgMenuItemComponent, AgPromise, Optional, Component } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { PrimaryColsPanel } from '@ag-grid-enterprise/column-tool-panel';

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let EnterpriseMenuFactory = class EnterpriseMenuFactory extends BeanStub {
    hideActiveMenu() {
        this.destroyBean(this.activeMenu);
    }
    showMenuAfterMouseEvent(column, mouseEvent, defaultTab) {
        this.showMenu(column, (menu) => {
            const ePopup = menu.getGui();
            this.popupService.positionPopupUnderMouseEvent({
                type: 'columnMenu',
                column,
                mouseEvent,
                ePopup
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, 'columnMenu', defaultTab, undefined, mouseEvent.target);
    }
    showMenuAfterButtonClick(column, eventSource, containerType, defaultTab, restrictToTabs) {
        let multiplier = -1;
        let alignSide = 'left';
        if (this.gridOptionsService.is('enableRtl')) {
            multiplier = 1;
            alignSide = 'right';
        }
        this.showMenu(column, (menu) => {
            const ePopup = menu.getGui();
            this.popupService.positionPopupByComponent({
                type: containerType,
                column,
                eventSource,
                ePopup,
                alignSide,
                nudgeX: 9 * multiplier,
                nudgeY: -23,
                position: 'under',
                keepWithinBounds: true,
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, containerType, defaultTab, restrictToTabs, eventSource);
    }
    showMenu(column, positionCallback, containerType, defaultTab, restrictToTabs, eventSource) {
        const { menu, eMenuGui, currentHeaderPosition, currentColumnIndex, anchorToElement } = this.getMenuParams(column, restrictToTabs, eventSource);
        const closedFuncs = [];
        closedFuncs.push(this.getClosedCallback(column, menu, currentHeaderPosition, currentColumnIndex, eventSource));
        const translate = this.localeService.getLocaleTextFunc();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: (e) => {
                closedFuncs.forEach(f => f(e));
            },
            afterGuiAttached: params => menu.afterGuiAttached(Object.assign({}, { container: containerType }, params)),
            // if defaultTab is not present, positionCallback will be called
            // after `showTabBasedOnPreviousSelection` is called.
            positionCallback: !!defaultTab ? () => positionCallback(menu) : undefined,
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
        const stopAnchoringPromise = this.popupService.setPopupPositionRelatedToElement(eMenuGui, anchorToElement);
        if (stopAnchoringPromise) {
            this.addStopAnchoring(stopAnchoringPromise, column, closedFuncs);
        }
        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, (event) => {
            this.lastSelectedTab = event.key;
        });
        column.setMenuVisible(true, 'contextMenu');
        this.activeMenu = menu;
        menu.addEventListener(BeanStub.EVENT_DESTROYED, () => {
            if (this.activeMenu === menu) {
                this.activeMenu = null;
            }
        });
    }
    addStopAnchoring(stopAnchoringPromise, column, closedFuncsArr) {
        stopAnchoringPromise.then((stopAnchoringFunc) => {
            column.addEventListener('leftChanged', stopAnchoringFunc);
            column.addEventListener('visibleChanged', stopAnchoringFunc);
            closedFuncsArr.push(() => {
                column.removeEventListener('leftChanged', stopAnchoringFunc);
                column.removeEventListener('visibleChanged', stopAnchoringFunc);
            });
        });
    }
    getClosedCallback(column, menu, headerPosition, columnIndex, eventSource) {
        return (e) => {
            this.destroyBean(menu);
            column.setMenuVisible(false, 'contextMenu');
            const isKeyboardEvent = e instanceof KeyboardEvent;
            if (!isKeyboardEvent || !eventSource) {
                return;
            }
            if (_.isVisible(eventSource)) {
                const focusableEl = this.focusService.findTabbableParent(eventSource);
                if (focusableEl) {
                    if (column) {
                        this.headerNavigationService.scrollToColumn(column);
                    }
                    focusableEl.focus();
                }
            }
            // if the focusEl is no longer in the DOM, we try to focus
            // the header that is closest to the previous header position
            else if (headerPosition && columnIndex !== -1) {
                const allColumns = this.columnModel.getAllDisplayedColumns();
                const columnToFocus = allColumns[columnIndex] || _.last(allColumns);
                if (columnToFocus) {
                    this.focusService.focusHeaderPosition({
                        headerPosition: {
                            headerRowIndex: headerPosition.headerRowIndex,
                            column: columnToFocus
                        }
                    });
                }
            }
        };
    }
    getMenuParams(column, restrictToTabs, eventSource) {
        const menu = this.createBean(new EnterpriseMenu(column, this.lastSelectedTab, restrictToTabs));
        return {
            menu,
            eMenuGui: menu.getGui(),
            currentHeaderPosition: this.focusService.getFocusedHeader(),
            currentColumnIndex: this.columnModel.getAllDisplayedColumns().indexOf(column),
            anchorToElement: eventSource || this.ctrlsService.getGridBodyCtrl().getGui()
        };
    }
    isMenuEnabled(column) {
        return column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT).length > 0;
    }
};
__decorate$3([
    Autowired('popupService')
], EnterpriseMenuFactory.prototype, "popupService", void 0);
__decorate$3([
    Autowired('focusService')
], EnterpriseMenuFactory.prototype, "focusService", void 0);
__decorate$3([
    Autowired('headerNavigationService')
], EnterpriseMenuFactory.prototype, "headerNavigationService", void 0);
__decorate$3([
    Autowired('ctrlsService')
], EnterpriseMenuFactory.prototype, "ctrlsService", void 0);
__decorate$3([
    Autowired('columnModel')
], EnterpriseMenuFactory.prototype, "columnModel", void 0);
EnterpriseMenuFactory = __decorate$3([
    Bean('menuFactory')
], EnterpriseMenuFactory);
class EnterpriseMenu extends BeanStub {
    constructor(column, initialSelection, restrictTo) {
        super();
        this.tabFactories = {};
        this.includeChecks = {};
        this.column = column;
        this.initialSelection = initialSelection;
        this.tabFactories[EnterpriseMenu.TAB_GENERAL] = this.createMainPanel.bind(this);
        this.tabFactories[EnterpriseMenu.TAB_FILTER] = this.createFilterPanel.bind(this);
        this.tabFactories[EnterpriseMenu.TAB_COLUMNS] = this.createColumnsPanel.bind(this);
        this.includeChecks[EnterpriseMenu.TAB_GENERAL] = () => true;
        this.includeChecks[EnterpriseMenu.TAB_FILTER] = () => this.filterManager.isFilterAllowed(column);
        this.includeChecks[EnterpriseMenu.TAB_COLUMNS] = () => true;
        this.restrictTo = restrictTo;
    }
    init() {
        const tabs = this.getTabsToCreate().map(name => this.createTab(name));
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
        this.addDestroyFunc(() => this.destroyBean(this.tabbedLayout));
    }
    getTabsToCreate() {
        if (this.restrictTo) {
            return this.restrictTo;
        }
        return this.column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT)
            .filter(tabName => this.isValidMenuTabItem(tabName))
            .filter(tabName => this.isNotSuppressed(tabName))
            .filter(tabName => this.isModuleLoaded(tabName));
    }
    isModuleLoaded(menuTabName) {
        if (menuTabName === EnterpriseMenu.TAB_COLUMNS) {
            return ModuleRegistry.isRegistered(ModuleNames.ColumnsToolPanelModule, this.context.getGridId());
        }
        return true;
    }
    isValidMenuTabItem(menuTabName) {
        let isValid = true;
        let itemsToConsider = EnterpriseMenu.TABS_DEFAULT;
        if (this.restrictTo != null) {
            isValid = this.restrictTo.indexOf(menuTabName) > -1;
            itemsToConsider = this.restrictTo;
        }
        isValid = isValid && EnterpriseMenu.TABS_DEFAULT.indexOf(menuTabName) > -1;
        if (!isValid) {
            console.warn(`AG Grid: Trying to render an invalid menu item '${menuTabName}'. Check that your 'menuTabs' contains one of [${itemsToConsider}]`);
        }
        return isValid;
    }
    isNotSuppressed(menuTabName) {
        return this.includeChecks[menuTabName]();
    }
    createTab(name) {
        return this.tabFactories[name]();
    }
    showTabBasedOnPreviousSelection() {
        // show the tab the user was on last time they had a menu open
        this.showTab(this.initialSelection);
    }
    showTab(toShow) {
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
    }
    onTabItemClicked(event) {
        let key = null;
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
    }
    activateTab(tab) {
        const ev = {
            type: EnterpriseMenu.EVENT_TAB_SELECTED,
            key: tab
        };
        this.dispatchEvent(ev);
    }
    getMenuItems() {
        const defaultMenuOptions = this.getDefaultMenuOptions();
        let result;
        const userFunc = this.gridOptionsService.getCallback('getMainMenuItems');
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
    }
    getDefaultMenuOptions() {
        const result = [];
        const allowPinning = !this.column.getColDef().lockPinned;
        const rowGroupCount = this.columnModel.getRowGroupColumns().length;
        const doingGrouping = rowGroupCount > 0;
        const groupedByThisColumn = this.columnModel.getRowGroupColumns().indexOf(this.column) >= 0;
        const allowValue = this.column.isAllowValue();
        const allowRowGroup = this.column.isAllowRowGroup();
        const isPrimary = this.column.isPrimary();
        const pivotModeOn = this.columnModel.isPivotMode();
        const isInMemoryRowModel = this.rowModel.getType() === 'clientSide';
        const usingTreeData = this.gridOptionsService.isTreeData();
        const allowValueAgg = 
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
        const allowExpandAndContract = isInMemoryRowModel && (usingTreeData || rowGroupCount > (pivotModeOn ? 1 : 0));
        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }
        return result;
    }
    createMainPanel() {
        this.mainMenuList = this.createManagedBean(new AgMenuList());
        const menuItems = this.getMenuItems();
        const menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, this.column);
        this.mainMenuList.addMenuItems(menuItemsMapped);
        this.mainMenuList.addEventListener(AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: _.createIconNoSpan('menu', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_GENERAL.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(this.mainMenuList.getGui()),
            name: EnterpriseMenu.TAB_GENERAL
        };
        return this.tabItemGeneral;
    }
    onHidePopup(event) {
        let keyboardEvent;
        if (event && event.event && event.event instanceof KeyboardEvent) {
            keyboardEvent = event.event;
        }
        this.hidePopupFunc(keyboardEvent && { keyboardEvent: keyboardEvent });
        // this method only gets called when the menu was closed by selection an option
        // in this case we highlight the cell that was previously highlighted
        const focusedCell = this.focusService.getFocusedCell();
        const eDocument = this.gridOptionsService.getDocument();
        if (eDocument.activeElement === eDocument.body && focusedCell) {
            const { rowIndex, rowPinned, column } = focusedCell;
            this.focusService.setFocusedCell({ rowIndex, column, rowPinned, forceBrowserFocus: true, preventScrollOnBrowserFocus: true });
        }
    }
    createFilterPanel() {
        const filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column, 'COLUMN_MENU');
        if (!filterWrapper) {
            throw new Error('AG Grid - Unable to instantiate filter');
        }
        const afterFilterAttachedCallback = (params) => {
            if (!(filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise)) {
                return;
            }
            // slightly odd block this - this promise will always have been resolved by the time it gets here, so won't be
            // async (_unless_ in react or similar, but if so why not encountered before now?).
            // I'd suggest a future improvement would be to remove/replace this promise as this block just wont work if it is
            // async and is confusing if you don't have this context
            filterWrapper.filterPromise.then(filter => {
                if (filter && filter.afterGuiAttached) {
                    filter.afterGuiAttached(params);
                }
            });
        };
        // see comment above
        const afterDetachedCallback = () => { var _a; return (_a = filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise) === null || _a === void 0 ? void 0 : _a.then(filter => { var _a; return (_a = filter === null || filter === void 0 ? void 0 : filter.afterGuiDetached) === null || _a === void 0 ? void 0 : _a.call(filter); }); };
        this.tabItemFilter = {
            title: _.createIconNoSpan('filter', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_FILTER.replace('MenuTab', ''),
            bodyPromise: filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.guiPromise,
            afterAttachedCallback: afterFilterAttachedCallback,
            afterDetachedCallback,
            name: EnterpriseMenu.TAB_FILTER
        };
        return this.tabItemFilter;
    }
    createColumnsPanel() {
        const eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-menu-column-select-wrapper');
        const columnSelectPanel = this.createManagedBean(new PrimaryColsPanel());
        let columnsMenuParams = this.column.getColDef().columnsMenuParams;
        if (!columnsMenuParams) {
            columnsMenuParams = {};
        }
        const { contractColumnSelection, suppressColumnExpandAll, suppressColumnFilter, suppressColumnSelectAll, suppressSyncLayoutWithGrid, columnLayout } = columnsMenuParams;
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
        const columnSelectPanelGui = columnSelectPanel.getGui();
        columnSelectPanelGui.classList.add('ag-menu-column-select');
        eWrapperDiv.appendChild(columnSelectPanelGui);
        this.tabItemColumns = {
            title: _.createIconNoSpan('columns', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_COLUMNS.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(eWrapperDiv),
            name: EnterpriseMenu.TAB_COLUMNS
        };
        return this.tabItemColumns;
    }
    afterGuiAttached(params) {
        const { container, hidePopup } = params;
        this.tabbedLayout.setAfterAttachedParams({ container, hidePopup });
        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
    }
    getGui() {
        return this.tabbedLayout.getGui();
    }
}
EnterpriseMenu.EVENT_TAB_SELECTED = 'tabSelected';
EnterpriseMenu.TAB_FILTER = 'filterMenuTab';
EnterpriseMenu.TAB_GENERAL = 'generalMenuTab';
EnterpriseMenu.TAB_COLUMNS = 'columnsMenuTab';
EnterpriseMenu.TABS_DEFAULT = [EnterpriseMenu.TAB_GENERAL, EnterpriseMenu.TAB_FILTER, EnterpriseMenu.TAB_COLUMNS];
EnterpriseMenu.MENU_ITEM_SEPARATOR = 'separator';
__decorate$3([
    Autowired('columnModel')
], EnterpriseMenu.prototype, "columnModel", void 0);
__decorate$3([
    Autowired('filterManager')
], EnterpriseMenu.prototype, "filterManager", void 0);
__decorate$3([
    Autowired('gridApi')
], EnterpriseMenu.prototype, "gridApi", void 0);
__decorate$3([
    Autowired('columnApi')
], EnterpriseMenu.prototype, "columnApi", void 0);
__decorate$3([
    Autowired('menuItemMapper')
], EnterpriseMenu.prototype, "menuItemMapper", void 0);
__decorate$3([
    Autowired('rowModel')
], EnterpriseMenu.prototype, "rowModel", void 0);
__decorate$3([
    Autowired('focusService')
], EnterpriseMenu.prototype, "focusService", void 0);
__decorate$3([
    PostConstruct
], EnterpriseMenu.prototype, "init", null);

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const CSS_MENU = 'ag-menu';
const CSS_CONTEXT_MENU_OPEN = 'ag-context-menu-open';
let ContextMenuFactory = class ContextMenuFactory extends BeanStub {
    hideActiveMenu() {
        this.destroyBean(this.activeMenu);
    }
    getMenuItems(node, column, value) {
        const defaultMenuOptions = [];
        if (_.exists(node) && ModuleRegistry.isRegistered(ModuleNames.ClipboardModule, this.context.getGridId())) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                if (!this.gridOptionsService.is('suppressCutToClipboard')) {
                    defaultMenuOptions.push('cut');
                }
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'copyWithGroupHeaders', 'paste', 'separator');
            }
        }
        if (this.gridOptionsService.is('enableCharts') && ModuleRegistry.isRegistered(ModuleNames.GridChartsModule, this.context.getGridId())) {
            if (this.columnModel.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            if (this.rangeService && !this.rangeService.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }
        if (_.exists(node)) {
            // if user clicks a cell
            const csvModuleMissing = !ModuleRegistry.isRegistered(ModuleNames.CsvExportModule, this.context.getGridId());
            const excelModuleMissing = !ModuleRegistry.isRegistered(ModuleNames.ExcelExportModule, this.context.getGridId());
            const suppressExcel = this.gridOptionsService.is('suppressExcelExport') || excelModuleMissing;
            const suppressCsv = this.gridOptionsService.is('suppressCsvExport') || csvModuleMissing;
            const onIPad = _.isIOSUserAgent();
            const anyExport = !onIPad && (!suppressExcel || !suppressCsv);
            if (anyExport) {
                defaultMenuOptions.push('export');
            }
        }
        const userFunc = this.gridOptionsService.getCallback('getContextMenuItems');
        if (userFunc) {
            const params = {
                node: node,
                column: column,
                value: value,
                defaultItems: defaultMenuOptions.length ? defaultMenuOptions : undefined,
            };
            return userFunc(params);
        }
        return defaultMenuOptions;
    }
    onContextMenu(mouseEvent, touchEvent, rowNode, column, value, anchorToElement) {
        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.gridOptionsService.is('allowContextMenuWithControlKey')) {
            // then do the check
            if (mouseEvent && (mouseEvent.ctrlKey || mouseEvent.metaKey)) {
                return;
            }
        }
        // need to do this regardless of context menu showing or not, so doing
        // before the isSuppressContextMenu() check
        if (mouseEvent) {
            this.blockMiddleClickScrollsIfNeeded(mouseEvent);
        }
        if (this.gridOptionsService.is('suppressContextMenu')) {
            return;
        }
        const eventOrTouch = mouseEvent ? mouseEvent : touchEvent.touches[0];
        if (this.showMenu(rowNode, column, value, eventOrTouch, anchorToElement)) {
            const event = mouseEvent ? mouseEvent : touchEvent;
            event.preventDefault();
        }
    }
    blockMiddleClickScrollsIfNeeded(mouseEvent) {
        // if we don't do this, then middle click will never result in a 'click' event, as 'mousedown'
        // will be consumed by the browser to mean 'scroll' (as you can scroll with the middle mouse
        // button in the browser). so this property allows the user to receive middle button clicks if
        // they want.
        const { gridOptionsService } = this;
        const { which } = mouseEvent;
        if (gridOptionsService.is('suppressMiddleClickScrolls') && which === 2) {
            mouseEvent.preventDefault();
        }
    }
    showMenu(node, column, value, mouseEvent, anchorToElement) {
        const menuItems = this.getMenuItems(node, column, value);
        const eGridBodyGui = this.ctrlsService.getGridBodyCtrl().getGui();
        if (menuItems === undefined || _.missingOrEmpty(menuItems)) {
            return false;
        }
        const menu = new ContextMenu(menuItems);
        this.createBean(menu);
        const eMenuGui = menu.getGui();
        const positionParams = {
            column: column,
            rowNode: node,
            type: 'contextMenu',
            mouseEvent: mouseEvent,
            ePopup: eMenuGui,
            // move one pixel away so that accidentally double clicking
            // won't show the browser's contextmenu
            nudgeY: 1
        };
        const translate = this.localeService.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: () => {
                eGridBodyGui.classList.remove(CSS_CONTEXT_MENU_OPEN);
                this.destroyBean(menu);
            },
            click: mouseEvent,
            positionCallback: () => {
                const isRtl = this.gridOptionsService.is('enableRtl');
                this.popupService.positionPopupUnderMouseEvent(Object.assign(Object.assign({}, positionParams), { nudgeX: isRtl ? (eMenuGui.offsetWidth + 1) * -1 : 1 }));
            },
            // so when browser is scrolled down, or grid is scrolled, context menu stays with cell
            anchorToElement: anchorToElement,
            ariaLabel: translate('ariaLabelContextMenu', 'Context Menu')
        });
        if (addPopupRes) {
            eGridBodyGui.classList.add(CSS_CONTEXT_MENU_OPEN);
            menu.afterGuiAttached({ container: 'contextMenu', hidePopup: addPopupRes.hideFunc });
        }
        // there should never be an active menu at this point, however it was found
        // that you could right click a second time just 1 or 2 pixels from the first
        // click, and another menu would pop up. so somehow the logic for closing the
        // first menu (clicking outside should close it) was glitchy somehow. an easy
        // way to avoid this is just remove the old context menu here if it exists.
        if (this.activeMenu) {
            this.hideActiveMenu();
        }
        this.activeMenu = menu;
        menu.addEventListener(BeanStub.EVENT_DESTROYED, () => {
            if (this.activeMenu === menu) {
                this.activeMenu = null;
            }
        });
        // hide the popup if something gets selected
        if (addPopupRes) {
            menu.addEventListener(AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, addPopupRes.hideFunc);
        }
        return true;
    }
};
__decorate$2([
    Autowired('popupService')
], ContextMenuFactory.prototype, "popupService", void 0);
__decorate$2([
    Optional('rangeService')
], ContextMenuFactory.prototype, "rangeService", void 0);
__decorate$2([
    Autowired('ctrlsService')
], ContextMenuFactory.prototype, "ctrlsService", void 0);
__decorate$2([
    Autowired('columnModel')
], ContextMenuFactory.prototype, "columnModel", void 0);
ContextMenuFactory = __decorate$2([
    Bean('contextMenuFactory')
], ContextMenuFactory);
class ContextMenu extends Component {
    constructor(menuItems) {
        super(/* html */ `<div class="${CSS_MENU}" role="presentation"></div>`);
        this.menuList = null;
        this.focusedCell = null;
        this.menuItems = menuItems;
    }
    addMenuItems() {
        const menuList = this.createManagedBean(new AgMenuList());
        const menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null);
        menuList.addMenuItems(menuItemsMapped);
        this.appendChild(menuList);
        this.menuList = menuList;
        menuList.addEventListener(AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, (e) => this.dispatchEvent(e));
    }
    afterGuiAttached(params) {
        if (params.hidePopup) {
            this.addDestroyFunc(params.hidePopup);
        }
        this.focusedCell = this.focusService.getFocusedCell();
        if (this.menuList) {
            this.focusService.focusInto(this.menuList.getGui());
        }
    }
    restoreFocusedCell() {
        const currentFocusedCell = this.focusService.getFocusedCell();
        if (currentFocusedCell && this.focusedCell && this.cellPositionUtils.equals(currentFocusedCell, this.focusedCell)) {
            const { rowIndex, rowPinned, column } = this.focusedCell;
            const doc = this.gridOptionsService.getDocument();
            if (doc.activeElement === doc.body) {
                this.focusService.setFocusedCell({ rowIndex, column, rowPinned, forceBrowserFocus: true });
            }
        }
    }
    destroy() {
        this.restoreFocusedCell();
        super.destroy();
    }
}
__decorate$2([
    Autowired('menuItemMapper')
], ContextMenu.prototype, "menuItemMapper", void 0);
__decorate$2([
    Autowired('focusService')
], ContextMenu.prototype, "focusService", void 0);
__decorate$2([
    Autowired('cellPositionUtils')
], ContextMenu.prototype, "cellPositionUtils", void 0);
__decorate$2([
    PostConstruct
], ContextMenu.prototype, "addMenuItems", null);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let MenuItemMapper = class MenuItemMapper extends BeanStub {
    mapWithStockItems(originalList, column) {
        if (!originalList) {
            return [];
        }
        const resultList = [];
        originalList.forEach(menuItemOrString => {
            let result;
            if (typeof menuItemOrString === 'string') {
                result = this.getStockMenuItem(menuItemOrString, column);
            }
            else {
                // Spread to prevent leaking mapped subMenus back into the original menuItem
                result = Object.assign({}, menuItemOrString);
            }
            // if no mapping, can happen when module is not loaded but user tries to use module anyway
            if (!result) {
                return;
            }
            const resultDef = result;
            const { subMenu } = resultDef;
            if (subMenu && subMenu instanceof Array) {
                resultDef.subMenu = this.mapWithStockItems(subMenu, column);
            }
            if (result != null) {
                resultList.push(result);
            }
        });
        return resultList;
    }
    getStockMenuItem(key, column) {
        var _a;
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const skipHeaderOnAutoSize = this.gridOptionsService.is('skipHeaderOnAutoSize');
        switch (key) {
            case 'pinSubMenu':
                return {
                    name: localeTextFunc('pinColumn', 'Pin Column'),
                    icon: _.createIconNoSpan('menuPin', this.gridOptionsService, null),
                    subMenu: ['clearPinned', 'pinLeft', 'pinRight']
                };
            case 'pinLeft':
                return {
                    name: localeTextFunc('pinLeft', 'Pin Left'),
                    action: () => this.columnModel.setColumnPinned(column, 'left', "contextMenu"),
                    checked: !!column && column.isPinnedLeft()
                };
            case 'pinRight':
                return {
                    name: localeTextFunc('pinRight', 'Pin Right'),
                    action: () => this.columnModel.setColumnPinned(column, 'right', "contextMenu"),
                    checked: !!column && column.isPinnedRight()
                };
            case 'clearPinned':
                return {
                    name: localeTextFunc('noPin', 'No Pin'),
                    action: () => this.columnModel.setColumnPinned(column, null, "contextMenu"),
                    checked: !!column && !column.isPinned()
                };
            case 'valueAggSubMenu':
                if (ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Aggregation from Menu', this.context.getGridId())) {
                    if (!(column === null || column === void 0 ? void 0 : column.isPrimary()) && !(column === null || column === void 0 ? void 0 : column.getColDef().pivotValueColumn)) {
                        return null;
                    }
                    return {
                        name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                        icon: _.createIconNoSpan('menuValue', this.gridOptionsService, null),
                        subMenu: this.createAggregationSubMenu(column)
                    };
                }
                else {
                    return null;
                }
            case 'autoSizeThis':
                return {
                    name: localeTextFunc('autosizeThiscolumn', 'Autosize This Column'),
                    action: () => this.columnModel.autoSizeColumn(column, skipHeaderOnAutoSize, "contextMenu")
                };
            case 'autoSizeAll':
                return {
                    name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                    action: () => this.columnModel.autoSizeAllColumns(skipHeaderOnAutoSize, "contextMenu")
                };
            case 'rowGroup':
                return {
                    name: localeTextFunc('groupBy', 'Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: (column === null || column === void 0 ? void 0 : column.isRowGroupActive()) || !(column === null || column === void 0 ? void 0 : column.getColDef().enableRowGroup),
                    action: () => this.columnModel.addRowGroupColumn(column, "contextMenu"),
                    icon: _.createIconNoSpan('menuAddRowGroup', this.gridOptionsService, null)
                };
            case 'rowUnGroup':
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: !(column === null || column === void 0 ? void 0 : column.isRowGroupActive()) || !(column === null || column === void 0 ? void 0 : column.getColDef().enableRowGroup),
                    action: () => this.columnModel.removeRowGroupColumn(column, "contextMenu"),
                    icon: _.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsService, null)
                };
            case 'resetColumns':
                return {
                    name: localeTextFunc('resetColumns', 'Reset Columns'),
                    action: () => this.columnModel.resetColumnState("contextMenu")
                };
            case 'expandAll':
                return {
                    name: localeTextFunc('expandAll', 'Expand All Row Groups'),
                    action: () => this.gridApi.expandAll()
                };
            case 'contractAll':
                return {
                    name: localeTextFunc('collapseAll', 'Collapse All Row Groups'),
                    action: () => this.gridApi.collapseAll()
                };
            case 'copy':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copy', 'Copy'),
                        shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: () => this.clipboardService.copyToClipboard()
                    };
                }
                else {
                    return null;
                }
            case 'copyWithHeaders':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy with Headers from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: () => this.clipboardService.copyToClipboard({ includeHeaders: true })
                    };
                }
                else {
                    return null;
                }
            case 'copyWithGroupHeaders':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy with Group Headers from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copyWithGroupHeaders', 'Copy with Group Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: () => this.clipboardService.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true })
                    };
                }
                else {
                    return null;
                }
            case 'cut':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Cut from Menu', this.context.getGridId())) {
                    const focusedCell = this.focusService.getFocusedCell();
                    const rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
                    const isEditable = rowNode ? focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.column.isCellEditable(rowNode) : false;
                    return {
                        name: localeTextFunc('cut', 'Cut'),
                        shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                        icon: _.createIconNoSpan('clipboardCut', this.gridOptionsService, null),
                        disabled: !isEditable || this.gridOptionsService.is('suppressCutToClipboard'),
                        action: () => this.clipboardService.cutToClipboard(undefined, 'contextMenu')
                    };
                }
                else {
                    return null;
                }
            case 'paste':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Paste from Clipboard', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('paste', 'Paste'),
                        shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                        disabled: true,
                        icon: _.createIconNoSpan('clipboardPaste', this.gridOptionsService, null),
                        action: () => this.clipboardService.pasteFromClipboard()
                    };
                }
                else {
                    return null;
                }
            case 'export':
                const exportSubMenuItems = [];
                const csvModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.CsvExportModule, this.context.getGridId());
                const excelModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.ExcelExportModule, this.context.getGridId());
                if (!this.gridOptionsService.is('suppressCsvExport') && csvModuleLoaded) {
                    exportSubMenuItems.push('csvExport');
                }
                if (!this.gridOptionsService.is('suppressExcelExport') && excelModuleLoaded) {
                    exportSubMenuItems.push('excelExport');
                }
                return {
                    name: localeTextFunc('export', 'Export'),
                    subMenu: exportSubMenuItems,
                    icon: _.createIconNoSpan('save', this.gridOptionsService, null),
                };
            case 'csvExport':
                return {
                    name: localeTextFunc('csvExport', 'CSV Export'),
                    icon: _.createIconNoSpan('csvExport', this.gridOptionsService, null),
                    action: () => this.gridApi.exportDataAsCsv({})
                };
            case 'excelExport':
                return {
                    name: localeTextFunc('excelExport', 'Excel Export'),
                    icon: _.createIconNoSpan('excelExport', this.gridOptionsService, null),
                    action: () => this.gridApi.exportDataAsExcel()
                };
            case 'separator':
                return 'separator';
            case 'pivotChart':
            case 'chartRange':
                return (_a = this.chartMenuItemMapper.getChartItems(key)) !== null && _a !== void 0 ? _a : null;
            default: {
                console.warn(`AG Grid: unknown menu item type ${key}`);
                return null;
            }
        }
    }
    createAggregationSubMenu(column) {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        let columnToUse;
        if (column.isPrimary()) {
            columnToUse = column;
        }
        else {
            const pivotValueColumn = column.getColDef().pivotValueColumn;
            columnToUse = _.exists(pivotValueColumn) ? pivotValueColumn : undefined;
        }
        const result = [];
        if (columnToUse) {
            const columnIsAlreadyAggValue = columnToUse.isValueActive();
            const funcNames = this.aggFuncService.getFuncNames(columnToUse);
            result.push({
                name: localeTextFunc('noAggregation', 'None'),
                action: () => {
                    this.columnModel.removeValueColumn(columnToUse, "contextMenu");
                    this.columnModel.setColumnAggFunc(columnToUse, undefined, "contextMenu");
                },
                checked: !columnIsAlreadyAggValue
            });
            funcNames.forEach(funcName => {
                result.push({
                    name: localeTextFunc(funcName, _.capitalise(funcName)),
                    action: () => {
                        this.columnModel.setColumnAggFunc(columnToUse, funcName, "contextMenu");
                        this.columnModel.addValueColumn(columnToUse, "contextMenu");
                    },
                    checked: columnIsAlreadyAggValue && columnToUse.getAggFunc() === funcName
                });
            });
        }
        return result;
    }
};
__decorate$1([
    Autowired('columnModel')
], MenuItemMapper.prototype, "columnModel", void 0);
__decorate$1([
    Autowired('gridApi')
], MenuItemMapper.prototype, "gridApi", void 0);
__decorate$1([
    Optional('clipboardService')
], MenuItemMapper.prototype, "clipboardService", void 0);
__decorate$1([
    Optional('aggFuncService')
], MenuItemMapper.prototype, "aggFuncService", void 0);
__decorate$1([
    Autowired('focusService')
], MenuItemMapper.prototype, "focusService", void 0);
__decorate$1([
    Autowired('rowPositionUtils')
], MenuItemMapper.prototype, "rowPositionUtils", void 0);
__decorate$1([
    Autowired('chartMenuItemMapper')
], MenuItemMapper.prototype, "chartMenuItemMapper", void 0);
MenuItemMapper = __decorate$1([
    Bean('menuItemMapper')
], MenuItemMapper);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.0';

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ChartMenuItemMapper_1;
let ChartMenuItemMapper = ChartMenuItemMapper_1 = class ChartMenuItemMapper extends BeanStub {
    getChartItems(key) {
        var _a, _b;
        if (!this.chartService) {
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, `the Context Menu key "${key}"`, this.context.getGridId());
            return undefined;
        }
        const builder = key === 'pivotChart'
            ? new PivotMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService)
            : new RangeMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService);
        let topLevelMenuItem = builder.getMenuItem();
        const chartGroupsDef = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.settingsPanel) === null || _b === void 0 ? void 0 : _b.chartGroupsDef;
        if (chartGroupsDef) {
            // Apply filtering and ordering if chartGroupsDef provided
            topLevelMenuItem = ChartMenuItemMapper_1.filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, builder.getConfigLookup());
        }
        return this.cleanInternals(topLevelMenuItem);
    }
    // Remove our internal _key properties so this does not leak out of the class on the menu items.
    cleanInternals(menuItem) {
        if (!menuItem) {
            return menuItem;
        }
        const removeKey = (m) => {
            var _a;
            m === null || m === void 0 ? true : delete m._key;
            (_a = m === null || m === void 0 ? void 0 : m.subMenu) === null || _a === void 0 ? void 0 : _a.forEach(s => removeKey(s));
            return m;
        };
        return removeKey(menuItem);
    }
    static buildLookup(menuItem) {
        let itemLookup = {};
        const addItem = (item) => {
            itemLookup[item._key] = item;
            if (item.subMenu) {
                item.subMenu.forEach(s => addItem(s));
            }
        };
        addItem(menuItem);
        return itemLookup;
    }
    /**
     * Make the MenuItem match the charts provided and their ordering on the ChartGroupsDef config object as provided by the user.
     */
    static filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, configLookup) {
        var _a;
        const menuItemLookup = this.buildLookup(topLevelMenuItem);
        let orderedAndFiltered = Object.assign(Object.assign({}, topLevelMenuItem), { subMenu: [] });
        Object.entries(chartGroupsDef).forEach(([group, chartTypes]) => {
            var _a, _b;
            const chartConfigGroup = configLookup[group];
            if (chartConfigGroup == undefined) {
                _.doOnce(() => console.warn(`AG Grid - invalid chartGroupsDef config '${group}'`), `invalid_chartGroupsDef${group}`);
                return undefined;
            }
            const menuItem = menuItemLookup[chartConfigGroup._key];
            if (menuItem) {
                if (menuItem.subMenu) {
                    const subMenus = chartTypes.map(chartType => {
                        const itemKey = chartConfigGroup[chartType];
                        if (itemKey == undefined) {
                            _.doOnce(() => console.warn(`AG Grid - invalid chartGroupsDef config '${group}.${chartType}'`), `invalid_chartGroupsDef${chartType}_${group}`);
                            return undefined;
                        }
                        return menuItemLookup[itemKey];
                    }).filter(s => s !== undefined);
                    if (subMenus.length > 0) {
                        menuItem.subMenu = subMenus;
                        (_a = orderedAndFiltered.subMenu) === null || _a === void 0 ? void 0 : _a.push(menuItem);
                    }
                }
                else {
                    // Handles line case which is not actually a sub subMenu
                    (_b = orderedAndFiltered.subMenu) === null || _b === void 0 ? void 0 : _b.push(menuItem);
                }
            }
        });
        if (((_a = orderedAndFiltered.subMenu) === null || _a === void 0 ? void 0 : _a.length) == 0) {
            return undefined;
        }
        return orderedAndFiltered;
    }
};
__decorate([
    Optional('chartService')
], ChartMenuItemMapper.prototype, "chartService", void 0);
ChartMenuItemMapper = ChartMenuItemMapper_1 = __decorate([
    Bean('chartMenuItemMapper')
], ChartMenuItemMapper);
class PivotMenuItemMapper {
    constructor(gridOptionsService, chartService, localeService) {
        this.gridOptionsService = gridOptionsService;
        this.chartService = chartService;
        this.localeService = localeService;
    }
    getMenuItem() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const getMenuItem = (localeKey, defaultText, chartType, key) => {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: () => this.chartService.createPivotChart({ chartType }),
                _key: key
            };
        };
        return {
            name: localeTextFunc('pivotChart', 'Pivot Chart'),
            _key: 'pivotChart',
            subMenu: [
                {
                    _key: 'pivotColumnChart',
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: [
                        getMenuItem('groupedColumn', 'Grouped&lrm;', 'groupedColumn', 'pivotGroupedColumn'),
                        getMenuItem('stackedColumn', 'Stacked&lrm;', 'stackedColumn', 'pivotStackedColumn'),
                        getMenuItem('normalizedColumn', '100% Stacked&lrm;', 'normalizedColumn', 'pivotNormalizedColumn')
                    ]
                },
                {
                    _key: 'pivotBarChart',
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: [
                        getMenuItem('groupedBar', 'Grouped&lrm;', 'groupedBar', 'pivotGroupedBar'),
                        getMenuItem('stackedBar', 'Stacked&lrm;', 'stackedBar', 'pivotStackedBar'),
                        getMenuItem('normalizedBar', '100% Stacked&lrm;', 'normalizedBar', 'pivotNormalizedBar')
                    ]
                },
                {
                    _key: 'pivotPieChart',
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: [
                        getMenuItem('pie', 'Pie&lrm;', 'pie', 'pivotPie'),
                        getMenuItem('doughnut', 'Doughnut&lrm;', 'doughnut', 'pivotDoughnut')
                    ]
                },
                getMenuItem('line', 'Line&lrm;', 'line', 'pivotLineChart'),
                {
                    _key: 'pivotXYChart',
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: [
                        getMenuItem('scatter', 'Scatter&lrm;', 'scatter', 'pivotScatter'),
                        getMenuItem('bubble', 'Bubble&lrm;', 'bubble', 'pivotBubble')
                    ]
                },
                {
                    _key: 'pivotAreaChart',
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: [
                        getMenuItem('area', 'Area&lrm;', 'area', 'pivotArea'),
                        getMenuItem('stackedArea', 'Stacked&lrm;', 'stackedArea', 'pivotStackedArea'),
                        getMenuItem('normalizedArea', '100% Stacked&lrm;', 'normalizedArea', 'pivotNormalizedArea')
                    ]
                },
                getMenuItem('histogramChart', 'Histogram&lrm;', 'histogram', 'pivotHistogramChart'),
                {
                    _key: 'pivotCombinationChart',
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: [
                        getMenuItem('columnLineCombo', 'Column & Line&lrm;', 'columnLineCombo', 'pivotColumnLineCombo'),
                        getMenuItem('AreaColumnCombo', 'Area & Column&lrm;', 'areaColumnCombo', 'pivotAreaColumnCombo')
                    ]
                }
            ],
            icon: _.createIconNoSpan('chart', this.gridOptionsService, undefined),
        };
    }
    getConfigLookup() {
        return {
            columnGroup: {
                _key: 'pivotColumnChart',
                column: 'pivotGroupedColumn',
                stackedColumn: 'pivotStackedColumn',
                normalizedColumn: 'pivotNormalizedColumn',
            },
            barGroup: {
                _key: 'pivotBarChart',
                bar: 'pivotGroupedBar',
                stackedBar: 'pivotStackedBar',
                normalizedBar: 'pivotNormalizedBar',
            },
            pieGroup: {
                _key: 'pivotPieChart',
                pie: 'pivotPie',
                doughnut: 'pivotDoughnut',
            },
            lineGroup: {
                _key: 'pivotLineChart',
                line: 'pivotLineChart',
            },
            scatterGroup: {
                _key: 'pivotXYChart',
                bubble: 'pivotBubble',
                scatter: 'pivotScatter',
            },
            areaGroup: {
                _key: 'pivotAreaChart',
                area: 'pivotArea',
                stackedArea: 'pivotStackedArea',
                normalizedArea: 'pivotNormalizedArea',
            },
            histogramGroup: {
                _key: 'pivotHistogramChart',
                histogram: 'pivotHistogramChart',
            },
            combinationGroup: {
                _key: 'pivotCombinationChart',
                columnLineCombo: 'pivotColumnLineCombo',
                areaColumnCombo: 'pivotAreaColumnCombo',
                customCombo: '' // Not currently supported but needs a value to separate from a missing value
            }
        };
    }
}
class RangeMenuItemMapper {
    constructor(gridOptionsService, chartService, localeService) {
        this.gridOptionsService = gridOptionsService;
        this.chartService = chartService;
        this.localeService = localeService;
    }
    getMenuItem() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const getMenuItem = (localeKey, defaultText, chartType, key) => {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: () => this.chartService.createChartFromCurrentRange(chartType),
                _key: key
            };
        };
        return {
            name: localeTextFunc('chartRange', 'Chart Range'),
            _key: 'chartRange',
            subMenu: [
                {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: [
                        getMenuItem('groupedColumn', 'Grouped&lrm;', 'groupedColumn', 'rangeGroupedColumn'),
                        getMenuItem('stackedColumn', 'Stacked&lrm;', 'stackedColumn', 'rangeStackedColumn'),
                        getMenuItem('normalizedColumn', '100% Stacked&lrm;', 'normalizedColumn', 'rangeNormalizedColumn')
                    ],
                    _key: 'rangeColumnChart'
                },
                {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: [
                        getMenuItem('groupedBar', 'Grouped&lrm;', 'groupedBar', 'rangeGroupedBar'),
                        getMenuItem('stackedBar', 'Stacked&lrm;', 'stackedBar', 'rangeStackedBar'),
                        getMenuItem('normalizedBar', '100% Stacked&lrm;', 'normalizedBar', 'rangeNormalizedBar')
                    ],
                    _key: 'rangeBarChart'
                },
                {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: [
                        getMenuItem('pie', 'Pie&lrm;', 'pie', 'rangePie'),
                        getMenuItem('doughnut', 'Doughnut&lrm;', 'doughnut', 'rangeDoughnut')
                    ],
                    _key: 'rangePieChart'
                },
                getMenuItem('line', 'Line&lrm;', 'line', 'rangeLineChart'),
                {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: [
                        getMenuItem('scatter', 'Scatter&lrm;', 'scatter', 'rangeScatter'),
                        getMenuItem('bubble', 'Bubble&lrm;', 'bubble', 'rangeBubble')
                    ],
                    _key: 'rangeXYChart'
                },
                {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: [
                        getMenuItem('area', 'Area&lrm;', 'area', 'rangeArea'),
                        getMenuItem('stackedArea', 'Stacked&lrm;', 'stackedArea', 'rangeStackedArea'),
                        getMenuItem('normalizedArea', '100% Stacked&lrm;', 'normalizedArea', 'rangeNormalizedArea')
                    ],
                    _key: 'rangeAreaChart'
                },
                getMenuItem('histogramChart', 'Histogram&lrm;', 'histogram', 'rangeHistogramChart'),
                {
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: [
                        getMenuItem('columnLineCombo', 'Column & Line&lrm;', 'columnLineCombo', 'rangeColumnLineCombo'),
                        getMenuItem('AreaColumnCombo', 'Area & Column&lrm;', 'areaColumnCombo', 'rangeAreaColumnCombo')
                    ],
                    _key: 'rangeCombinationChart'
                }
            ],
            icon: _.createIconNoSpan('chart', this.gridOptionsService, undefined),
        };
    }
    getConfigLookup() {
        return {
            columnGroup: {
                _key: 'rangeColumnChart',
                column: 'rangeGroupedColumn',
                stackedColumn: 'rangeStackedColumn',
                normalizedColumn: 'rangeNormalizedColumn',
            },
            barGroup: {
                _key: 'rangeBarChart',
                bar: 'rangeGroupedBar',
                stackedBar: 'rangeStackedBar',
                normalizedBar: 'rangeNormalizedBar',
            },
            pieGroup: {
                _key: 'rangePieChart',
                pie: 'rangePie',
                doughnut: 'rangeDoughnut',
            },
            lineGroup: {
                _key: 'rangeLineChart',
                line: 'rangeLineChart',
            },
            scatterGroup: {
                _key: 'rangeXYChart',
                bubble: 'rangeBubble',
                scatter: 'rangeScatter',
            },
            areaGroup: {
                _key: 'rangeAreaChart',
                area: 'rangeArea',
                stackedArea: 'rangeStackedArea',
                normalizedArea: 'rangeNormalizedArea',
            },
            histogramGroup: {
                _key: 'rangeHistogramChart',
                histogram: 'rangeHistogramChart',
            },
            combinationGroup: {
                _key: 'rangeCombinationChart',
                columnLineCombo: 'rangeColumnLineCombo',
                areaColumnCombo: 'rangeAreaColumnCombo',
                customCombo: '' // Not currently supported but needs a value to separate from a missing value
            }
        };
    }
}

const MenuModule = {
    version: VERSION,
    moduleName: ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper, ChartMenuItemMapper],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

export { MenuModule };
