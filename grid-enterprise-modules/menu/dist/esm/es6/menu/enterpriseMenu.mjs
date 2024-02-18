var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, ModuleNames, ModuleRegistry, PostConstruct, RefSelector, AgPromise, TabbedLayout, AgMenuItemComponent, Component, Events } from '@ag-grid-community/core';
let EnterpriseMenuFactory = class EnterpriseMenuFactory extends BeanStub {
    hideActiveMenu() {
        this.destroyBean(this.activeMenu);
    }
    showMenuAfterMouseEvent(column, mouseEvent, containerType, filtersOnly) {
        const defaultTab = filtersOnly ? 'filterMenuTab' : undefined;
        this.showMenu(column, (menu) => {
            var _a;
            const ePopup = menu.getGui();
            this.popupService.positionPopupUnderMouseEvent({
                type: containerType,
                column,
                mouseEvent,
                ePopup
            });
            if (defaultTab) {
                (_a = menu.showTab) === null || _a === void 0 ? void 0 : _a.call(menu, defaultTab);
            }
            this.dispatchVisibleChangedEvent(true, false, column, defaultTab);
        }, containerType, defaultTab, undefined, mouseEvent.target);
    }
    showMenuAfterButtonClick(column, eventSource, containerType, filtersOnly) {
        let multiplier = -1;
        let alignSide = 'left';
        if (this.gridOptionsService.get('enableRtl')) {
            multiplier = 1;
            alignSide = 'right';
        }
        const defaultTab = filtersOnly ? 'filterMenuTab' : undefined;
        const restrictToTabs = defaultTab ? [defaultTab] : undefined;
        const isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
        let nudgeX = (isLegacyMenuEnabled ? 9 : 4) * multiplier;
        let nudgeY = isLegacyMenuEnabled ? -23 : 4;
        this.showMenu(column, (menu) => {
            var _a;
            const ePopup = menu.getGui();
            this.popupService.positionPopupByComponent({
                type: containerType,
                column,
                eventSource,
                ePopup,
                alignSide,
                nudgeX,
                nudgeY,
                position: 'under',
                keepWithinBounds: true,
            });
            if (defaultTab) {
                (_a = menu.showTab) === null || _a === void 0 ? void 0 : _a.call(menu, defaultTab);
            }
            this.dispatchVisibleChangedEvent(true, false, column, defaultTab);
        }, containerType, defaultTab, restrictToTabs, eventSource);
    }
    showMenu(column, positionCallback, containerType, defaultTab, restrictToTabs, eventSource) {
        var _a;
        const { menu, eMenuGui, anchorToElement, restoreFocusParams } = this.getMenuParams(column, restrictToTabs, eventSource);
        const closedFuncs = [];
        if (column) {
            // if we don't have a column, then the menu wasn't launched via keyboard navigation
            closedFuncs.push((e) => {
                const eComp = menu.getGui();
                this.destroyBean(menu);
                column === null || column === void 0 ? void 0 : column.setMenuVisible(false, 'contextMenu');
                this.menuUtils.restoreFocusOnClose(restoreFocusParams, eComp, e);
            });
        }
        const translate = this.localeService.getLocaleTextFunc();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: (e) => {
                closedFuncs.forEach(f => f(e));
                this.dispatchVisibleChangedEvent(false, false, column, defaultTab);
            },
            afterGuiAttached: params => menu.afterGuiAttached(Object.assign({}, { container: containerType }, params)),
            // if defaultTab is not present, positionCallback will be called
            // after `showTabBasedOnPreviousSelection` is called.
            positionCallback: !!defaultTab ? () => positionCallback(menu) : undefined,
            ariaLabel: translate('ariaLabelColumnMenu', 'Column Menu')
        });
        if (!defaultTab) {
            (_a = menu.showTabBasedOnPreviousSelection) === null || _a === void 0 ? void 0 : _a.call(menu);
            // reposition the menu because the method above could load
            // an element that is bigger than enterpriseMenu header.
            positionCallback(menu);
        }
        if (this.menuService.isColumnMenuAnchoringEnabled()) {
            // if user starts showing / hiding columns, or otherwise move the underlying column
            // for this menu, we want to stop tracking the menu with the column position. otherwise
            // the menu would move as the user is using the columns tab inside the menu.
            const stopAnchoringPromise = this.popupService.setPopupPositionRelatedToElement(eMenuGui, anchorToElement);
            if (stopAnchoringPromise && column) {
                this.addStopAnchoring(stopAnchoringPromise, column, closedFuncs);
            }
        }
        menu.addEventListener(TabbedColumnMenu.EVENT_TAB_SELECTED, (event) => {
            this.dispatchVisibleChangedEvent(false, true, column);
            this.lastSelectedTab = event.key;
            this.dispatchVisibleChangedEvent(true, true, column);
        });
        column === null || column === void 0 ? void 0 : column.setMenuVisible(true, 'contextMenu');
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
    getMenuParams(column, restrictToTabs, eventSource) {
        const restoreFocusParams = {
            column,
            headerPosition: this.focusService.getFocusedHeader(),
            columnIndex: this.columnModel.getAllDisplayedColumns().indexOf(column),
            eventSource
        };
        const menu = this.createMenu(column, restoreFocusParams, restrictToTabs, eventSource);
        return {
            menu,
            eMenuGui: menu.getGui(),
            anchorToElement: eventSource || this.ctrlsService.getGridBodyCtrl().getGui(),
            restoreFocusParams
        };
    }
    createMenu(column, restoreFocusParams, restrictToTabs, eventSource) {
        if (this.menuService.isLegacyMenuEnabled()) {
            return this.createBean(new TabbedColumnMenu(column, restoreFocusParams, this.lastSelectedTab, restrictToTabs, eventSource));
        }
        else {
            return this.createBean(new ColumnContextMenu(column, restoreFocusParams, eventSource));
        }
    }
    dispatchVisibleChangedEvent(visible, switchingTab, column, defaultTab) {
        var _a, _b;
        const event = {
            type: Events.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
            visible,
            switchingTab,
            key: ((_b = (_a = this.lastSelectedTab) !== null && _a !== void 0 ? _a : defaultTab) !== null && _b !== void 0 ? _b : (this.menuService.isLegacyMenuEnabled() ? TabbedColumnMenu.TAB_GENERAL : 'columnMenu')),
            column: column !== null && column !== void 0 ? column : null
        };
        this.eventService.dispatchEvent(event);
    }
    isMenuEnabled(column) {
        var _a;
        if (!this.menuService.isLegacyMenuEnabled()) {
            return true;
        }
        // Determine whether there are any tabs to show in the menu, given that the filter tab may be hidden
        const isFilterDisabled = !this.filterManager.isFilterAllowed(column);
        const tabs = (_a = column.getColDef().menuTabs) !== null && _a !== void 0 ? _a : TabbedColumnMenu.TABS_DEFAULT;
        const numActiveTabs = isFilterDisabled && tabs.includes(TabbedColumnMenu.TAB_FILTER)
            ? tabs.length - 1
            : tabs.length;
        return numActiveTabs > 0;
    }
    showMenuAfterContextMenuEvent(column, mouseEvent, touchEvent) {
        this.menuUtils.onContextMenu(mouseEvent, touchEvent, (eventOrTouch) => {
            this.showMenuAfterMouseEvent(column, eventOrTouch, 'columnMenu');
            return true;
        });
    }
};
__decorate([
    Autowired('popupService')
], EnterpriseMenuFactory.prototype, "popupService", void 0);
__decorate([
    Autowired('focusService')
], EnterpriseMenuFactory.prototype, "focusService", void 0);
__decorate([
    Autowired('ctrlsService')
], EnterpriseMenuFactory.prototype, "ctrlsService", void 0);
__decorate([
    Autowired('columnModel')
], EnterpriseMenuFactory.prototype, "columnModel", void 0);
__decorate([
    Autowired('filterManager')
], EnterpriseMenuFactory.prototype, "filterManager", void 0);
__decorate([
    Autowired('menuUtils')
], EnterpriseMenuFactory.prototype, "menuUtils", void 0);
__decorate([
    Autowired('menuService')
], EnterpriseMenuFactory.prototype, "menuService", void 0);
EnterpriseMenuFactory = __decorate([
    Bean('enterpriseMenuFactory')
], EnterpriseMenuFactory);
export { EnterpriseMenuFactory };
class TabbedColumnMenu extends BeanStub {
    constructor(column, restoreFocusParams, initialSelection, restrictTo, sourceElement) {
        super();
        this.column = column;
        this.restoreFocusParams = restoreFocusParams;
        this.initialSelection = initialSelection;
        this.restrictTo = restrictTo;
        this.sourceElement = sourceElement;
        this.tabFactories = {};
        this.includeChecks = {};
        this.tabFactories[TabbedColumnMenu.TAB_GENERAL] = this.createMainPanel.bind(this);
        this.tabFactories[TabbedColumnMenu.TAB_FILTER] = this.createFilterPanel.bind(this);
        this.tabFactories[TabbedColumnMenu.TAB_COLUMNS] = this.createColumnsPanel.bind(this);
        this.includeChecks[TabbedColumnMenu.TAB_GENERAL] = () => true;
        this.includeChecks[TabbedColumnMenu.TAB_FILTER] = () => column ? this.filterManager.isFilterAllowed(column) : false;
        this.includeChecks[TabbedColumnMenu.TAB_COLUMNS] = () => true;
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
        var _a, _b;
        if (this.restrictTo) {
            return this.restrictTo;
        }
        return ((_b = (_a = this.column) === null || _a === void 0 ? void 0 : _a.getColDef().menuTabs) !== null && _b !== void 0 ? _b : TabbedColumnMenu.TABS_DEFAULT)
            .filter(tabName => this.isValidMenuTabItem(tabName))
            .filter(tabName => this.isNotSuppressed(tabName))
            .filter(tabName => this.isModuleLoaded(tabName));
    }
    isModuleLoaded(menuTabName) {
        if (menuTabName === TabbedColumnMenu.TAB_COLUMNS) {
            return ModuleRegistry.__isRegistered(ModuleNames.ColumnsToolPanelModule, this.context.getGridId());
        }
        return true;
    }
    isValidMenuTabItem(menuTabName) {
        let isValid = true;
        let itemsToConsider = TabbedColumnMenu.TABS_DEFAULT;
        if (this.restrictTo != null) {
            isValid = this.restrictTo.indexOf(menuTabName) > -1;
            itemsToConsider = this.restrictTo;
        }
        isValid = isValid && TabbedColumnMenu.TABS_DEFAULT.indexOf(menuTabName) > -1;
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
        if (this.tabItemColumns && toShow === TabbedColumnMenu.TAB_COLUMNS) {
            this.tabbedLayout.showItem(this.tabItemColumns);
        }
        else if (this.tabItemFilter && toShow === TabbedColumnMenu.TAB_FILTER) {
            this.tabbedLayout.showItem(this.tabItemFilter);
        }
        else if (this.tabItemGeneral && toShow === TabbedColumnMenu.TAB_GENERAL) {
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
                key = TabbedColumnMenu.TAB_COLUMNS;
                break;
            case this.tabItemFilter:
                key = TabbedColumnMenu.TAB_FILTER;
                break;
            case this.tabItemGeneral:
                key = TabbedColumnMenu.TAB_GENERAL;
                break;
        }
        if (key) {
            this.activateTab(key);
        }
    }
    activateTab(tab) {
        const ev = {
            type: TabbedColumnMenu.EVENT_TAB_SELECTED,
            key: tab
        };
        this.dispatchEvent(ev);
    }
    createMainPanel() {
        this.mainMenuList = this.columnMenuFactory.createMenu(this, this.column, () => { var _a; return (_a = this.sourceElement) !== null && _a !== void 0 ? _a : this.getGui(); });
        this.mainMenuList.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: _.createIconNoSpan('menu', this.gridOptionsService, this.column),
            titleLabel: TabbedColumnMenu.TAB_GENERAL.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(this.mainMenuList.getGui()),
            name: TabbedColumnMenu.TAB_GENERAL
        };
        return this.tabItemGeneral;
    }
    onHidePopup(event) {
        this.menuUtils.closePopupAndRestoreFocusOnSelect(this.hidePopupFunc, this.restoreFocusParams, event);
    }
    createFilterPanel() {
        const filterWrapper = this.column ? this.filterManager.getOrCreateFilterWrapper(this.column, 'COLUMN_MENU') : null;
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
            titleLabel: TabbedColumnMenu.TAB_FILTER.replace('MenuTab', ''),
            bodyPromise: filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.guiPromise,
            afterAttachedCallback: afterFilterAttachedCallback,
            afterDetachedCallback,
            name: TabbedColumnMenu.TAB_FILTER
        };
        return this.tabItemFilter;
    }
    createColumnsPanel() {
        const eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-menu-column-select-wrapper');
        const columnSelectPanel = this.columnChooserFactory.createColumnSelectPanel(this, this.column);
        const columnSelectPanelGui = columnSelectPanel.getGui();
        columnSelectPanelGui.classList.add('ag-menu-column-select');
        eWrapperDiv.appendChild(columnSelectPanelGui);
        this.tabItemColumns = {
            title: _.createIconNoSpan('columns', this.gridOptionsService, this.column),
            titleLabel: TabbedColumnMenu.TAB_COLUMNS.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(eWrapperDiv),
            name: TabbedColumnMenu.TAB_COLUMNS
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
TabbedColumnMenu.EVENT_TAB_SELECTED = 'tabSelected';
TabbedColumnMenu.TAB_FILTER = 'filterMenuTab';
TabbedColumnMenu.TAB_GENERAL = 'generalMenuTab';
TabbedColumnMenu.TAB_COLUMNS = 'columnsMenuTab';
TabbedColumnMenu.TABS_DEFAULT = [TabbedColumnMenu.TAB_GENERAL, TabbedColumnMenu.TAB_FILTER, TabbedColumnMenu.TAB_COLUMNS];
__decorate([
    Autowired('filterManager')
], TabbedColumnMenu.prototype, "filterManager", void 0);
__decorate([
    Autowired('columnChooserFactory')
], TabbedColumnMenu.prototype, "columnChooserFactory", void 0);
__decorate([
    Autowired('columnMenuFactory')
], TabbedColumnMenu.prototype, "columnMenuFactory", void 0);
__decorate([
    Autowired('menuUtils')
], TabbedColumnMenu.prototype, "menuUtils", void 0);
__decorate([
    PostConstruct
], TabbedColumnMenu.prototype, "init", null);
class ColumnContextMenu extends Component {
    constructor(column, restoreFocusParams, sourceElement) {
        super(/* html */ `
            <div ref="eColumnMenu" role="presentation" class="ag-menu ag-column-menu"></div>
        `);
        this.column = column;
        this.restoreFocusParams = restoreFocusParams;
        this.sourceElement = sourceElement;
    }
    init() {
        this.mainMenuList = this.columnMenuFactory.createMenu(this, this.column, () => { var _a; return (_a = this.sourceElement) !== null && _a !== void 0 ? _a : this.getGui(); });
        this.mainMenuList.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, this.onHidePopup.bind(this));
        this.eColumnMenu.appendChild(this.mainMenuList.getGui());
    }
    onHidePopup(event) {
        this.menuUtils.closePopupAndRestoreFocusOnSelect(this.hidePopupFunc, this.restoreFocusParams, event);
    }
    afterGuiAttached({ hidePopup }) {
        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
        this.focusService.focusInto(this.mainMenuList.getGui());
    }
}
__decorate([
    Autowired('columnMenuFactory')
], ColumnContextMenu.prototype, "columnMenuFactory", void 0);
__decorate([
    Autowired('menuUtils')
], ColumnContextMenu.prototype, "menuUtils", void 0);
__decorate([
    Autowired('focusService')
], ColumnContextMenu.prototype, "focusService", void 0);
__decorate([
    RefSelector('eColumnMenu')
], ColumnContextMenu.prototype, "eColumnMenu", void 0);
__decorate([
    PostConstruct
], ColumnContextMenu.prototype, "init", null);
