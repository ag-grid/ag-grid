var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, ModuleNames, ModuleRegistry, PostConstruct, AgPromise, TabbedLayout, AgMenuList, AgMenuItemComponent } from '@ag-grid-community/core';
import { PrimaryColsPanel } from '@ag-grid-enterprise/column-tool-panel';
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
        const addPopupRes = this.popupService.addPopup({
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
            anchorToElement,
            ariaLabel: translate('ariaLabelColumnMenu', 'Column Menu')
        });
        // if user starts showing / hiding columns, or otherwise move the underlying column
        // for this menu, we want to stop tracking the menu with the column position. otherwise
        // the menu would move as the user is using the columns tab inside the menu.
        this.addStopAnchoring(addPopupRes === null || addPopupRes === void 0 ? void 0 : addPopupRes.stopAnchoringPromise, column, closedFuncs);
        if (!defaultTab) {
            menu.showTabBasedOnPreviousSelection();
            // reposition the menu because the method above could load
            // an element that is bigger than enterpriseMenu header.
            positionCallback(menu);
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
    addStopAnchoring(stopAnchoringPromise, column, closedFuncsArr) {
        if (!stopAnchoringPromise) {
            return;
        }
        stopAnchoringPromise.then((stopAnchoringFunc) => {
            column.addEventListener('leftChanged', stopAnchoringFunc);
            column.addEventListener('visibleChanged', stopAnchoringFunc);
            closedFuncsArr.push(() => {
                column.removeEventListener('leftChanged', stopAnchoringFunc);
                column.removeEventListener('visibleChanged', stopAnchoringFunc);
            });
        });
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
export { EnterpriseMenuFactory };
export class EnterpriseMenu extends BeanStub {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50ZXJwcmlzZU1lbnUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWVudS9lbnRlcnByaXNlTWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUVELFNBQVMsRUFDVCxJQUFJLEVBQ0osUUFBUSxFQVdSLFdBQVcsRUFDWCxjQUFjLEVBRWQsYUFBYSxFQUNiLFNBQVMsRUFFVCxZQUFZLEVBS1osVUFBVSxFQUNWLG1CQUFtQixFQUt0QixNQUFNLHlCQUF5QixDQUFDO0FBR2pDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBT3pFLElBQWEscUJBQXFCLEdBQWxDLE1BQWEscUJBQXNCLFNBQVEsUUFBUTtJQVd4QyxjQUFjO1FBQ2pCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSx1QkFBdUIsQ0FBQyxNQUFjLEVBQUUsVUFBc0IsRUFBRSxVQUFtQjtRQUN0RixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQW9CLEVBQUUsRUFBRTtZQUMzQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFN0IsSUFBSSxDQUFDLFlBQVksQ0FBQyw0QkFBNEIsQ0FBQztnQkFDM0MsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLE1BQU07Z0JBQ04sVUFBVTtnQkFDVixNQUFNO2FBQ1QsQ0FBQyxDQUFDO1lBRUgsSUFBSSxVQUFVLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUM1QjtRQUNMLENBQUMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsTUFBcUIsQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFTSx3QkFBd0IsQ0FBQyxNQUFjLEVBQUUsV0FBd0IsRUFBRSxhQUE0QixFQUFF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