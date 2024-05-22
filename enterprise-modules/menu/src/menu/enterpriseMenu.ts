import {
    AgEvent,
    AgGridEvent,
    AgPromise,
    Autowired,
    BaseBean,
    Bean,
    BeanStub,
    Column,
    ColumnMenuTab,
    ColumnMenuVisibleChangedEvent,
    Component,
    ContainerType,
    CtrlsService,
    Events,
    FilterManager,
    FilterWrapperComp,
    FocusService,
    IAfterGuiAttachedParams,
    IMenuFactory,
    MenuService,
    ModuleNames,
    ModuleRegistry,
    PopupEventParams,
    PopupService,
    RefSelector,
    TabbedItem,
    TabbedLayout,
    VisibleColsService,
    WithoutGridCommon,
    _createIconNoSpan,
} from '@ag-grid-community/core';
import { AgMenuItemComponent, AgMenuList, CloseMenuEvent } from '@ag-grid-enterprise/core';

import { ColumnChooserFactory } from './columnChooserFactory';
import { ColumnMenuFactory } from './columnMenuFactory';
import { MenuRestoreFocusParams, MenuUtils } from './menuUtils';

export interface TabSelectedEvent extends AgEvent {
    key: string;
}

interface EnterpriseColumnMenu extends BaseBean {
    getGui(): HTMLElement;
    showTab?(tab: string): void;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    showTabBasedOnPreviousSelection?(): void;
}

@Bean('enterpriseMenuFactory')
export class EnterpriseMenuFactory extends BeanStub implements IMenuFactory {
    @Autowired('popupService') private readonly popupService: PopupService;
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('ctrlsService') private readonly ctrlsService: CtrlsService;
    @Autowired('visibleColsService') private readonly visibleColsService: VisibleColsService;
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('menuUtils') private readonly menuUtils: MenuUtils;
    @Autowired('menuService') private readonly menuService: MenuService;

    private lastSelectedTab: string;
    private activeMenu: EnterpriseColumnMenu | null;

    public hideActiveMenu(): void {
        this.destroyBean(this.activeMenu);
    }

    public showMenuAfterMouseEvent(
        column: Column | undefined,
        mouseEvent: MouseEvent | Touch,
        containerType: ContainerType,
        filtersOnly?: boolean
    ): void {
        const defaultTab = filtersOnly ? 'filterMenuTab' : undefined;
        this.showMenu(
            column,
            (menu: EnterpriseColumnMenu) => {
                const ePopup = menu.getGui();

                this.popupService.positionPopupUnderMouseEvent({
                    type: containerType,
                    column,
                    mouseEvent,
                    ePopup,
                });

                if (defaultTab) {
                    menu.showTab?.(defaultTab);
                }
                this.dispatchVisibleChangedEvent(true, false, column, defaultTab);
            },
            containerType,
            defaultTab,
            undefined,
            mouseEvent.target as HTMLElement
        );
    }

    public showMenuAfterButtonClick(
        column: Column | undefined,
        eventSource: HTMLElement,
        containerType: ContainerType,
        filtersOnly?: boolean
    ): void {
        let multiplier = -1;
        let alignSide: 'left' | 'right' = 'left';

        if (this.gos.get('enableRtl')) {
            multiplier = 1;
            alignSide = 'right';
        }

        const defaultTab: ColumnMenuTab | undefined = filtersOnly ? 'filterMenuTab' : undefined;
        const restrictToTabs = defaultTab ? [defaultTab] : undefined;

        const isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
        let nudgeX = (isLegacyMenuEnabled ? 9 : 4) * multiplier;
        let nudgeY = isLegacyMenuEnabled ? -23 : 4;

        this.showMenu(
            column,
            (menu: EnterpriseColumnMenu) => {
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
                    menu.showTab?.(defaultTab);
                }
                this.dispatchVisibleChangedEvent(true, false, column, defaultTab);
            },
            containerType,
            defaultTab,
            restrictToTabs,
            eventSource
        );
    }

    private showMenu(
        column: Column | undefined,
        positionCallback: (menu: EnterpriseColumnMenu) => void,
        containerType: ContainerType,
        defaultTab?: string,
        restrictToTabs?: ColumnMenuTab[],
        eventSource?: HTMLElement
    ): void {
        const { menu, eMenuGui, anchorToElement, restoreFocusParams } = this.getMenuParams(
            column,
            restrictToTabs,
            eventSource
        );
        const closedFuncs: ((e?: Event) => void)[] = [];

        closedFuncs.push((e) => {
            const eComp = menu.getGui();
            this.destroyBean(menu);
            if (column) {
                column.setMenuVisible(false, 'contextMenu');
                // if we don't have a column, then the menu wasn't launched via keyboard navigation
                this.menuUtils.restoreFocusOnClose(restoreFocusParams, eComp, e);
            }
        });

        const translate = this.localeService.getLocaleTextFunc();

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: (e?: Event) => {
                // menu closed callback
                closedFuncs.forEach((f) => f(e));
                this.dispatchVisibleChangedEvent(false, false, column, defaultTab);
            },
            afterGuiAttached: (params) =>
                menu.afterGuiAttached(Object.assign({}, { container: containerType }, params)),
            // if defaultTab is not present, positionCallback will be called
            // after `showTabBasedOnPreviousSelection` is called.
            positionCallback: !!defaultTab ? () => positionCallback(menu) : undefined,
            ariaLabel: translate('ariaLabelColumnMenu', 'Column Menu'),
        });

        if (!defaultTab) {
            menu.showTabBasedOnPreviousSelection?.();
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

        menu.addEventListener(TabbedColumnMenu.EVENT_TAB_SELECTED, (event: AgGridEvent & { key: string }) => {
            this.dispatchVisibleChangedEvent(false, true, column);
            this.lastSelectedTab = event.key;
            this.dispatchVisibleChangedEvent(true, true, column);
        });

        column?.setMenuVisible(true, 'contextMenu');

        this.activeMenu = menu;

        menu.addEventListener(BeanStub.EVENT_DESTROYED, () => {
            if (this.activeMenu === menu) {
                this.activeMenu = null;
            }
        });
    }

    private addStopAnchoring(
        stopAnchoringPromise: AgPromise<() => void>,
        column: Column,
        closedFuncsArr: (() => void)[]
    ) {
        stopAnchoringPromise.then((stopAnchoringFunc: () => void) => {
            column.addEventListener('leftChanged', stopAnchoringFunc);
            column.addEventListener('visibleChanged', stopAnchoringFunc);

            closedFuncsArr.push(() => {
                column.removeEventListener('leftChanged', stopAnchoringFunc);
                column.removeEventListener('visibleChanged', stopAnchoringFunc);
            });
        });
    }

    private getMenuParams(column: Column | undefined, restrictToTabs?: ColumnMenuTab[], eventSource?: HTMLElement) {
        const restoreFocusParams = {
            column,
            headerPosition: this.focusService.getFocusedHeader(),
            columnIndex: this.visibleColsService.getAllCols().indexOf(column!),
            eventSource,
        };
        const menu = this.createMenu(column, restoreFocusParams, restrictToTabs, eventSource);
        return {
            menu,
            eMenuGui: menu.getGui(),
            anchorToElement: eventSource || this.ctrlsService.getGridBodyCtrl().getGui(),
            restoreFocusParams,
        };
    }

    private createMenu(
        column: Column | undefined,
        restoreFocusParams: MenuRestoreFocusParams,
        restrictToTabs?: ColumnMenuTab[],
        eventSource?: HTMLElement
    ): EnterpriseColumnMenu & BeanStub {
        if (this.menuService.isLegacyMenuEnabled()) {
            return this.createBean(
                new TabbedColumnMenu(column, restoreFocusParams, this.lastSelectedTab, restrictToTabs, eventSource)
            );
        } else {
            return this.createBean(new ColumnContextMenu(column, restoreFocusParams, eventSource));
        }
    }

    private dispatchVisibleChangedEvent(
        visible: boolean,
        switchingTab: boolean,
        column?: Column,
        defaultTab?: string
    ): void {
        const event: WithoutGridCommon<ColumnMenuVisibleChangedEvent> = {
            type: Events.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
            visible,
            switchingTab,
            key: (this.lastSelectedTab ??
                defaultTab ??
                (this.menuService.isLegacyMenuEnabled() ? TabbedColumnMenu.TAB_GENERAL : 'columnMenu')) as any,
            column: column ?? null,
        };
        this.eventService.dispatchEvent(event);
    }

    public isMenuEnabled(column: Column): boolean {
        if (!this.menuService.isLegacyMenuEnabled()) {
            return true;
        }
        // Determine whether there are any tabs to show in the menu, given that the filter tab may be hidden
        const isFilterDisabled = !this.filterManager.isFilterAllowed(column);
        const tabs = column.getColDef().menuTabs ?? TabbedColumnMenu.TABS_DEFAULT;
        const numActiveTabs =
            isFilterDisabled && tabs.includes(TabbedColumnMenu.TAB_FILTER) ? tabs.length - 1 : tabs.length;
        return numActiveTabs > 0;
    }

    public showMenuAfterContextMenuEvent(
        column: Column<any> | undefined,
        mouseEvent?: MouseEvent | null,
        touchEvent?: TouchEvent | null
    ): void {
        this.menuUtils.onContextMenu(mouseEvent, touchEvent, (eventOrTouch) => {
            this.showMenuAfterMouseEvent(column, eventOrTouch, 'columnMenu');
            return true;
        });
    }
}

class TabbedColumnMenu extends BeanStub implements EnterpriseColumnMenu {
    public static EVENT_TAB_SELECTED = 'tabSelected';
    public static TAB_FILTER: 'filterMenuTab' = 'filterMenuTab';
    public static TAB_GENERAL: 'generalMenuTab' = 'generalMenuTab';
    public static TAB_COLUMNS: 'columnsMenuTab' = 'columnsMenuTab';
    public static TABS_DEFAULT: ColumnMenuTab[] = [
        TabbedColumnMenu.TAB_GENERAL,
        TabbedColumnMenu.TAB_FILTER,
        TabbedColumnMenu.TAB_COLUMNS,
    ];

    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('columnChooserFactory') private readonly columnChooserFactory: ColumnChooserFactory;
    @Autowired('columnMenuFactory') private readonly columnMenuFactory: ColumnMenuFactory;
    @Autowired('menuUtils') private readonly menuUtils: MenuUtils;

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: (popupParams?: PopupEventParams) => void;
    private mainMenuList: AgMenuList;

    private tabItemFilter: TabbedItem;
    private tabItemGeneral: TabbedItem;
    private tabItemColumns: TabbedItem;

    private tabFactories: { [p: string]: () => TabbedItem } = {};
    private includeChecks: { [p: string]: () => boolean } = {};

    constructor(
        private readonly column: Column | undefined,
        private readonly restoreFocusParams: MenuRestoreFocusParams,
        private readonly initialSelection: string,
        private readonly restrictTo?: ColumnMenuTab[],
        private readonly sourceElement?: HTMLElement
    ) {
        super();
        this.tabFactories[TabbedColumnMenu.TAB_GENERAL] = this.createMainPanel.bind(this);
        this.tabFactories[TabbedColumnMenu.TAB_FILTER] = this.createFilterPanel.bind(this);
        this.tabFactories[TabbedColumnMenu.TAB_COLUMNS] = this.createColumnsPanel.bind(this);

        this.includeChecks[TabbedColumnMenu.TAB_GENERAL] = () => true;
        this.includeChecks[TabbedColumnMenu.TAB_FILTER] = () =>
            column ? this.filterManager.isFilterAllowed(column) : false;
        this.includeChecks[TabbedColumnMenu.TAB_COLUMNS] = () => true;
    }

    public override postConstruct(): void {
        super.postConstruct();
        const tabs = this.getTabsToCreate().map((name) => this.createTab(name));

        this.tabbedLayout = new TabbedLayout({
            items: tabs,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this),
        });

        this.createBean(this.tabbedLayout);

        if (this.mainMenuList) {
            this.mainMenuList.setParentComponent(this.tabbedLayout);
        }

        this.addDestroyFunc(() => this.destroyBean(this.tabbedLayout));
    }

    private getTabsToCreate() {
        if (this.restrictTo) {
            return this.restrictTo;
        }

        return (this.column?.getColDef().menuTabs ?? TabbedColumnMenu.TABS_DEFAULT)
            .filter((tabName) => this.isValidMenuTabItem(tabName))
            .filter((tabName) => this.isNotSuppressed(tabName))
            .filter((tabName) => this.isModuleLoaded(tabName));
    }

    private isModuleLoaded(menuTabName: string): boolean {
        if (menuTabName === TabbedColumnMenu.TAB_COLUMNS) {
            return ModuleRegistry.__isRegistered(ModuleNames.ColumnsToolPanelModule, this.context.getGridId());
        }

        return true;
    }

    private isValidMenuTabItem(menuTabName: ColumnMenuTab): boolean {
        let isValid: boolean = true;
        let itemsToConsider = TabbedColumnMenu.TABS_DEFAULT;

        if (this.restrictTo != null) {
            isValid = this.restrictTo.indexOf(menuTabName) > -1;
            itemsToConsider = this.restrictTo;
        }

        isValid = isValid && TabbedColumnMenu.TABS_DEFAULT.indexOf(menuTabName) > -1;

        if (!isValid) {
            console.warn(
                `AG Grid: Trying to render an invalid menu item '${menuTabName}'. Check that your 'menuTabs' contains one of [${itemsToConsider}]`
            );
        }

        return isValid;
    }

    private isNotSuppressed(menuTabName: string): boolean {
        return this.includeChecks[menuTabName]();
    }

    private createTab(name: string): TabbedItem {
        return this.tabFactories[name]();
    }

    public showTabBasedOnPreviousSelection(): void {
        // show the tab the user was on last time they had a menu open
        this.showTab(this.initialSelection);
    }

    public showTab(toShow: string) {
        if (this.tabItemColumns && toShow === TabbedColumnMenu.TAB_COLUMNS) {
            this.tabbedLayout.showItem(this.tabItemColumns);
        } else if (this.tabItemFilter && toShow === TabbedColumnMenu.TAB_FILTER) {
            this.tabbedLayout.showItem(this.tabItemFilter);
        } else if (this.tabItemGeneral && toShow === TabbedColumnMenu.TAB_GENERAL) {
            this.tabbedLayout.showItem(this.tabItemGeneral);
        } else {
            this.tabbedLayout.showFirstItem();
        }
    }

    private onTabItemClicked(event: { item: TabbedItem }): void {
        let key: string | null = null;

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

    private activateTab(tab: string): void {
        const ev: TabSelectedEvent = {
            type: TabbedColumnMenu.EVENT_TAB_SELECTED,
            key: tab,
        };
        this.dispatchEvent(ev);
    }

    private createMainPanel(): TabbedItem {
        this.mainMenuList = this.columnMenuFactory.createMenu(
            this,
            this.column,
            () => this.sourceElement ?? this.getGui()
        );
        this.mainMenuList.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, this.onHidePopup.bind(this));

        this.tabItemGeneral = {
            title: _createIconNoSpan('menu', this.gos, this.column)!,
            titleLabel: TabbedColumnMenu.TAB_GENERAL.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(this.mainMenuList.getGui()),
            name: TabbedColumnMenu.TAB_GENERAL,
        };

        return this.tabItemGeneral;
    }

    private onHidePopup(event?: CloseMenuEvent): void {
        this.menuUtils.closePopupAndRestoreFocusOnSelect(this.hidePopupFunc, this.restoreFocusParams, event);
    }

    private createFilterPanel(): TabbedItem {
        const comp = this.column ? this.createManagedBean(new FilterWrapperComp(this.column, 'COLUMN_MENU')) : null;
        if (!comp?.hasFilter()) {
            throw new Error('AG Grid - Unable to instantiate filter');
        }

        const afterAttachedCallback = (params: IAfterGuiAttachedParams) => comp.afterGuiAttached(params);

        const afterDetachedCallback = () => comp.afterGuiDetached();

        this.tabItemFilter = {
            title: _createIconNoSpan('filter', this.gos, this.column)!,
            titleLabel: TabbedColumnMenu.TAB_FILTER.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(comp?.getGui()) as AgPromise<HTMLElement>,
            afterAttachedCallback,
            afterDetachedCallback,
            name: TabbedColumnMenu.TAB_FILTER,
        };

        return this.tabItemFilter;
    }

    private createColumnsPanel(): TabbedItem {
        const eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-menu-column-select-wrapper');

        const columnSelectPanel = this.columnChooserFactory.createColumnSelectPanel(this, this.column);

        const columnSelectPanelGui = columnSelectPanel.getGui();
        columnSelectPanelGui.classList.add('ag-menu-column-select');
        eWrapperDiv.appendChild(columnSelectPanelGui);

        this.tabItemColumns = {
            title: _createIconNoSpan('columns', this.gos, this.column)!, //createColumnsIcon(),
            titleLabel: TabbedColumnMenu.TAB_COLUMNS.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(eWrapperDiv),
            name: TabbedColumnMenu.TAB_COLUMNS,
        };

        return this.tabItemColumns;
    }

    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        const { container, hidePopup } = params;

        this.tabbedLayout.setAfterAttachedParams({ container, hidePopup });

        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout.getGui();
    }
}

class ColumnContextMenu extends Component implements EnterpriseColumnMenu {
    @Autowired('columnMenuFactory') private readonly columnMenuFactory: ColumnMenuFactory;
    @Autowired('menuUtils') private readonly menuUtils: MenuUtils;
    @Autowired('focusService') private readonly focusService: FocusService;

    @RefSelector('eColumnMenu') private readonly eColumnMenu: HTMLElement;

    private hidePopupFunc: (popupParams?: PopupEventParams) => void;
    private mainMenuList: AgMenuList;

    constructor(
        private readonly column: Column | undefined,
        private readonly restoreFocusParams: MenuRestoreFocusParams,
        private readonly sourceElement?: HTMLElement
    ) {
        super(/* html */ `
            <div ref="eColumnMenu" role="presentation" class="ag-menu ag-column-menu"></div>
        `);
    }

    public override postConstruct(): void {
        super.postConstruct();
        this.mainMenuList = this.columnMenuFactory.createMenu(
            this,
            this.column,
            () => this.sourceElement ?? this.getGui()
        );
        this.mainMenuList.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, this.onHidePopup.bind(this));
        this.eColumnMenu.appendChild(this.mainMenuList.getGui());
    }

    private onHidePopup(event?: CloseMenuEvent): void {
        this.menuUtils.closePopupAndRestoreFocusOnSelect(this.hidePopupFunc, this.restoreFocusParams, event);
    }

    public afterGuiAttached({ hidePopup }: IAfterGuiAttachedParams): void {
        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
        this.focusService.focusInto(this.mainMenuList.getGui());
    }
}
