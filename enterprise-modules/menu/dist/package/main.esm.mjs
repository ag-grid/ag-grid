var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/menu/src/menuModule.ts
import { ModuleNames as ModuleNames5 } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/menu/src/menu/enterpriseMenu.ts
import {
  _,
  Autowired,
  Bean,
  BeanStub,
  ModuleNames,
  ModuleRegistry,
  PostConstruct,
  RefSelector,
  AgPromise,
  TabbedLayout,
  AgMenuItemComponent,
  Component,
  Events,
  FilterWrapperComp
} from "@ag-grid-community/core";
var EnterpriseMenuFactory = class extends BeanStub {
  hideActiveMenu() {
    this.destroyBean(this.activeMenu);
  }
  showMenuAfterMouseEvent(column, mouseEvent, containerType, filtersOnly) {
    const defaultTab = filtersOnly ? "filterMenuTab" : void 0;
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
        (_a = menu.showTab) == null ? void 0 : _a.call(menu, defaultTab);
      }
      this.dispatchVisibleChangedEvent(true, false, column, defaultTab);
    }, containerType, defaultTab, void 0, mouseEvent.target);
  }
  showMenuAfterButtonClick(column, eventSource, containerType, filtersOnly) {
    let multiplier = -1;
    let alignSide = "left";
    if (this.gos.get("enableRtl")) {
      multiplier = 1;
      alignSide = "right";
    }
    const defaultTab = filtersOnly ? "filterMenuTab" : void 0;
    const restrictToTabs = defaultTab ? [defaultTab] : void 0;
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
        position: "under",
        keepWithinBounds: true
      });
      if (defaultTab) {
        (_a = menu.showTab) == null ? void 0 : _a.call(menu, defaultTab);
      }
      this.dispatchVisibleChangedEvent(true, false, column, defaultTab);
    }, containerType, defaultTab, restrictToTabs, eventSource);
  }
  showMenu(column, positionCallback, containerType, defaultTab, restrictToTabs, eventSource) {
    var _a;
    const { menu, eMenuGui, anchorToElement, restoreFocusParams } = this.getMenuParams(column, restrictToTabs, eventSource);
    const closedFuncs = [];
    closedFuncs.push(
      (e) => {
        const eComp = menu.getGui();
        this.destroyBean(menu);
        if (column) {
          column.setMenuVisible(false, "contextMenu");
          this.menuUtils.restoreFocusOnClose(restoreFocusParams, eComp, e);
        }
      }
    );
    const translate = this.localeService.getLocaleTextFunc();
    this.popupService.addPopup({
      modal: true,
      eChild: eMenuGui,
      closeOnEsc: true,
      closedCallback: (e) => {
        closedFuncs.forEach((f) => f(e));
        this.dispatchVisibleChangedEvent(false, false, column, defaultTab);
      },
      afterGuiAttached: (params) => menu.afterGuiAttached(Object.assign({}, { container: containerType }, params)),
      // if defaultTab is not present, positionCallback will be called
      // after `showTabBasedOnPreviousSelection` is called.
      positionCallback: !!defaultTab ? () => positionCallback(menu) : void 0,
      ariaLabel: translate("ariaLabelColumnMenu", "Column Menu")
    });
    if (!defaultTab) {
      (_a = menu.showTabBasedOnPreviousSelection) == null ? void 0 : _a.call(menu);
      positionCallback(menu);
    }
    if (this.menuService.isColumnMenuAnchoringEnabled()) {
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
    column == null ? void 0 : column.setMenuVisible(true, "contextMenu");
    this.activeMenu = menu;
    menu.addEventListener(BeanStub.EVENT_DESTROYED, () => {
      if (this.activeMenu === menu) {
        this.activeMenu = null;
      }
    });
  }
  addStopAnchoring(stopAnchoringPromise, column, closedFuncsArr) {
    stopAnchoringPromise.then((stopAnchoringFunc) => {
      column.addEventListener("leftChanged", stopAnchoringFunc);
      column.addEventListener("visibleChanged", stopAnchoringFunc);
      closedFuncsArr.push(() => {
        column.removeEventListener("leftChanged", stopAnchoringFunc);
        column.removeEventListener("visibleChanged", stopAnchoringFunc);
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
    } else {
      return this.createBean(new ColumnContextMenu(column, restoreFocusParams, eventSource));
    }
  }
  dispatchVisibleChangedEvent(visible, switchingTab, column, defaultTab) {
    var _a, _b;
    const event = {
      type: Events.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
      visible,
      switchingTab,
      key: (_b = (_a = this.lastSelectedTab) != null ? _a : defaultTab) != null ? _b : this.menuService.isLegacyMenuEnabled() ? TabbedColumnMenu.TAB_GENERAL : "columnMenu",
      column: column != null ? column : null
    };
    this.eventService.dispatchEvent(event);
  }
  isMenuEnabled(column) {
    var _a;
    if (!this.menuService.isLegacyMenuEnabled()) {
      return true;
    }
    const isFilterDisabled = !this.filterManager.isFilterAllowed(column);
    const tabs = (_a = column.getColDef().menuTabs) != null ? _a : TabbedColumnMenu.TABS_DEFAULT;
    const numActiveTabs = isFilterDisabled && tabs.includes(TabbedColumnMenu.TAB_FILTER) ? tabs.length - 1 : tabs.length;
    return numActiveTabs > 0;
  }
  showMenuAfterContextMenuEvent(column, mouseEvent, touchEvent) {
    this.menuUtils.onContextMenu(mouseEvent, touchEvent, (eventOrTouch) => {
      this.showMenuAfterMouseEvent(column, eventOrTouch, "columnMenu");
      return true;
    });
  }
};
__decorateClass([
  Autowired("popupService")
], EnterpriseMenuFactory.prototype, "popupService", 2);
__decorateClass([
  Autowired("focusService")
], EnterpriseMenuFactory.prototype, "focusService", 2);
__decorateClass([
  Autowired("ctrlsService")
], EnterpriseMenuFactory.prototype, "ctrlsService", 2);
__decorateClass([
  Autowired("columnModel")
], EnterpriseMenuFactory.prototype, "columnModel", 2);
__decorateClass([
  Autowired("filterManager")
], EnterpriseMenuFactory.prototype, "filterManager", 2);
__decorateClass([
  Autowired("menuUtils")
], EnterpriseMenuFactory.prototype, "menuUtils", 2);
__decorateClass([
  Autowired("menuService")
], EnterpriseMenuFactory.prototype, "menuService", 2);
EnterpriseMenuFactory = __decorateClass([
  Bean("enterpriseMenuFactory")
], EnterpriseMenuFactory);
var _TabbedColumnMenu = class _TabbedColumnMenu extends BeanStub {
  constructor(column, restoreFocusParams, initialSelection, restrictTo, sourceElement) {
    super();
    this.column = column;
    this.restoreFocusParams = restoreFocusParams;
    this.initialSelection = initialSelection;
    this.restrictTo = restrictTo;
    this.sourceElement = sourceElement;
    this.tabFactories = {};
    this.includeChecks = {};
    this.tabFactories[_TabbedColumnMenu.TAB_GENERAL] = this.createMainPanel.bind(this);
    this.tabFactories[_TabbedColumnMenu.TAB_FILTER] = this.createFilterPanel.bind(this);
    this.tabFactories[_TabbedColumnMenu.TAB_COLUMNS] = this.createColumnsPanel.bind(this);
    this.includeChecks[_TabbedColumnMenu.TAB_GENERAL] = () => true;
    this.includeChecks[_TabbedColumnMenu.TAB_FILTER] = () => column ? this.filterManager.isFilterAllowed(column) : false;
    this.includeChecks[_TabbedColumnMenu.TAB_COLUMNS] = () => true;
  }
  init() {
    const tabs = this.getTabsToCreate().map((name) => this.createTab(name));
    this.tabbedLayout = new TabbedLayout({
      items: tabs,
      cssClass: "ag-menu",
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
    return ((_b = (_a = this.column) == null ? void 0 : _a.getColDef().menuTabs) != null ? _b : _TabbedColumnMenu.TABS_DEFAULT).filter((tabName) => this.isValidMenuTabItem(tabName)).filter((tabName) => this.isNotSuppressed(tabName)).filter((tabName) => this.isModuleLoaded(tabName));
  }
  isModuleLoaded(menuTabName) {
    if (menuTabName === _TabbedColumnMenu.TAB_COLUMNS) {
      return ModuleRegistry.__isRegistered(ModuleNames.ColumnsToolPanelModule, this.context.getGridId());
    }
    return true;
  }
  isValidMenuTabItem(menuTabName) {
    let isValid = true;
    let itemsToConsider = _TabbedColumnMenu.TABS_DEFAULT;
    if (this.restrictTo != null) {
      isValid = this.restrictTo.indexOf(menuTabName) > -1;
      itemsToConsider = this.restrictTo;
    }
    isValid = isValid && _TabbedColumnMenu.TABS_DEFAULT.indexOf(menuTabName) > -1;
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
    this.showTab(this.initialSelection);
  }
  showTab(toShow) {
    if (this.tabItemColumns && toShow === _TabbedColumnMenu.TAB_COLUMNS) {
      this.tabbedLayout.showItem(this.tabItemColumns);
    } else if (this.tabItemFilter && toShow === _TabbedColumnMenu.TAB_FILTER) {
      this.tabbedLayout.showItem(this.tabItemFilter);
    } else if (this.tabItemGeneral && toShow === _TabbedColumnMenu.TAB_GENERAL) {
      this.tabbedLayout.showItem(this.tabItemGeneral);
    } else {
      this.tabbedLayout.showFirstItem();
    }
  }
  onTabItemClicked(event) {
    let key = null;
    switch (event.item) {
      case this.tabItemColumns:
        key = _TabbedColumnMenu.TAB_COLUMNS;
        break;
      case this.tabItemFilter:
        key = _TabbedColumnMenu.TAB_FILTER;
        break;
      case this.tabItemGeneral:
        key = _TabbedColumnMenu.TAB_GENERAL;
        break;
    }
    if (key) {
      this.activateTab(key);
    }
  }
  activateTab(tab) {
    const ev = {
      type: _TabbedColumnMenu.EVENT_TAB_SELECTED,
      key: tab
    };
    this.dispatchEvent(ev);
  }
  createMainPanel() {
    this.mainMenuList = this.columnMenuFactory.createMenu(this, this.column, () => {
      var _a;
      return (_a = this.sourceElement) != null ? _a : this.getGui();
    });
    this.mainMenuList.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, this.onHidePopup.bind(this));
    this.tabItemGeneral = {
      title: _.createIconNoSpan("menu", this.gos, this.column),
      titleLabel: _TabbedColumnMenu.TAB_GENERAL.replace("MenuTab", ""),
      bodyPromise: AgPromise.resolve(this.mainMenuList.getGui()),
      name: _TabbedColumnMenu.TAB_GENERAL
    };
    return this.tabItemGeneral;
  }
  onHidePopup(event) {
    this.menuUtils.closePopupAndRestoreFocusOnSelect(this.hidePopupFunc, this.restoreFocusParams, event);
  }
  createFilterPanel() {
    const comp = this.column ? this.createManagedBean(new FilterWrapperComp(this.column, "COLUMN_MENU")) : null;
    if (!(comp == null ? void 0 : comp.hasFilter())) {
      throw new Error("AG Grid - Unable to instantiate filter");
    }
    const afterAttachedCallback = (params) => comp.afterGuiAttached(params);
    const afterDetachedCallback = () => comp.afterGuiDetached();
    this.tabItemFilter = {
      title: _.createIconNoSpan("filter", this.gos, this.column),
      titleLabel: _TabbedColumnMenu.TAB_FILTER.replace("MenuTab", ""),
      bodyPromise: AgPromise.resolve(comp == null ? void 0 : comp.getGui()),
      afterAttachedCallback,
      afterDetachedCallback,
      name: _TabbedColumnMenu.TAB_FILTER
    };
    return this.tabItemFilter;
  }
  createColumnsPanel() {
    const eWrapperDiv = document.createElement("div");
    eWrapperDiv.classList.add("ag-menu-column-select-wrapper");
    const columnSelectPanel = this.columnChooserFactory.createColumnSelectPanel(this, this.column);
    const columnSelectPanelGui = columnSelectPanel.getGui();
    columnSelectPanelGui.classList.add("ag-menu-column-select");
    eWrapperDiv.appendChild(columnSelectPanelGui);
    this.tabItemColumns = {
      title: _.createIconNoSpan("columns", this.gos, this.column),
      //createColumnsIcon(),
      titleLabel: _TabbedColumnMenu.TAB_COLUMNS.replace("MenuTab", ""),
      bodyPromise: AgPromise.resolve(eWrapperDiv),
      name: _TabbedColumnMenu.TAB_COLUMNS
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
};
_TabbedColumnMenu.EVENT_TAB_SELECTED = "tabSelected";
_TabbedColumnMenu.TAB_FILTER = "filterMenuTab";
_TabbedColumnMenu.TAB_GENERAL = "generalMenuTab";
_TabbedColumnMenu.TAB_COLUMNS = "columnsMenuTab";
_TabbedColumnMenu.TABS_DEFAULT = [_TabbedColumnMenu.TAB_GENERAL, _TabbedColumnMenu.TAB_FILTER, _TabbedColumnMenu.TAB_COLUMNS];
__decorateClass([
  Autowired("filterManager")
], _TabbedColumnMenu.prototype, "filterManager", 2);
__decorateClass([
  Autowired("columnChooserFactory")
], _TabbedColumnMenu.prototype, "columnChooserFactory", 2);
__decorateClass([
  Autowired("columnMenuFactory")
], _TabbedColumnMenu.prototype, "columnMenuFactory", 2);
__decorateClass([
  Autowired("menuUtils")
], _TabbedColumnMenu.prototype, "menuUtils", 2);
__decorateClass([
  PostConstruct
], _TabbedColumnMenu.prototype, "init", 1);
var TabbedColumnMenu = _TabbedColumnMenu;
var ColumnContextMenu = class extends Component {
  constructor(column, restoreFocusParams, sourceElement) {
    super(
      /* html */
      `
            <div ref="eColumnMenu" role="presentation" class="ag-menu ag-column-menu"></div>
        `
    );
    this.column = column;
    this.restoreFocusParams = restoreFocusParams;
    this.sourceElement = sourceElement;
  }
  init() {
    this.mainMenuList = this.columnMenuFactory.createMenu(this, this.column, () => {
      var _a;
      return (_a = this.sourceElement) != null ? _a : this.getGui();
    });
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
};
__decorateClass([
  Autowired("columnMenuFactory")
], ColumnContextMenu.prototype, "columnMenuFactory", 2);
__decorateClass([
  Autowired("menuUtils")
], ColumnContextMenu.prototype, "menuUtils", 2);
__decorateClass([
  Autowired("focusService")
], ColumnContextMenu.prototype, "focusService", 2);
__decorateClass([
  RefSelector("eColumnMenu")
], ColumnContextMenu.prototype, "eColumnMenu", 2);
__decorateClass([
  PostConstruct
], ColumnContextMenu.prototype, "init", 1);

// enterprise-modules/menu/src/menu/contextMenu.ts
import {
  _ as _2,
  AgMenuItemComponent as AgMenuItemComponent2,
  AgMenuList as AgMenuList2,
  Autowired as Autowired2,
  Bean as Bean2,
  BeanStub as BeanStub2,
  Component as Component2,
  ModuleNames as ModuleNames2,
  ModuleRegistry as ModuleRegistry2,
  Optional,
  PostConstruct as PostConstruct2,
  Events as Events2
} from "@ag-grid-community/core";
var CSS_MENU = "ag-menu";
var CSS_CONTEXT_MENU_OPEN = "ag-context-menu-open";
var ContextMenuFactory = class extends BeanStub2 {
  hideActiveMenu() {
    this.destroyBean(this.activeMenu);
  }
  getMenuItems(node, column, value) {
    const defaultMenuOptions = [];
    if (_2.exists(node) && ModuleRegistry2.__isRegistered(ModuleNames2.ClipboardModule, this.context.getGridId())) {
      if (column) {
        if (!this.gos.get("suppressCutToClipboard")) {
          defaultMenuOptions.push("cut");
        }
        defaultMenuOptions.push("copy", "copyWithHeaders", "copyWithGroupHeaders", "paste", "separator");
      }
    }
    if (this.gos.get("enableCharts") && ModuleRegistry2.__isRegistered(ModuleNames2.GridChartsModule, this.context.getGridId())) {
      if (this.columnModel.isPivotMode()) {
        defaultMenuOptions.push("pivotChart");
      }
      if (this.rangeService && !this.rangeService.isEmpty()) {
        defaultMenuOptions.push("chartRange");
      }
    }
    if (_2.exists(node)) {
      const csvModuleMissing = !ModuleRegistry2.__isRegistered(ModuleNames2.CsvExportModule, this.context.getGridId());
      const excelModuleMissing = !ModuleRegistry2.__isRegistered(ModuleNames2.ExcelExportModule, this.context.getGridId());
      const suppressExcel = this.gos.get("suppressExcelExport") || excelModuleMissing;
      const suppressCsv = this.gos.get("suppressCsvExport") || csvModuleMissing;
      const onIPad = _2.isIOSUserAgent();
      const anyExport = !onIPad && (!suppressExcel || !suppressCsv);
      if (anyExport) {
        defaultMenuOptions.push("export");
      }
    }
    const defaultItems = defaultMenuOptions.length ? defaultMenuOptions : void 0;
    const columnContextMenuItems = column == null ? void 0 : column.getColDef().contextMenuItems;
    if (Array.isArray(columnContextMenuItems)) {
      return columnContextMenuItems;
    }
    if (typeof columnContextMenuItems === "function") {
      return columnContextMenuItems(this.gos.addGridCommonParams({
        column,
        node,
        value,
        defaultItems
      }));
    }
    const userFunc = this.gos.getCallback("getContextMenuItems");
    if (userFunc) {
      return userFunc({ column, node, value, defaultItems });
    }
    return defaultMenuOptions;
  }
  onContextMenu(mouseEvent, touchEvent, rowNode, column, value, anchorToElement) {
    this.menuUtils.onContextMenu(mouseEvent, touchEvent, (eventOrTouch) => this.showMenu(rowNode, column, value, eventOrTouch, anchorToElement));
  }
  showMenu(node, column, value, mouseEvent, anchorToElement) {
    const menuItems = this.getMenuItems(node, column, value);
    const eGridBodyGui = this.ctrlsService.getGridBodyCtrl().getGui();
    if (menuItems === void 0 || _2.missingOrEmpty(menuItems)) {
      return false;
    }
    const menu = new ContextMenu(menuItems, column, node, value);
    this.createBean(menu);
    const eMenuGui = menu.getGui();
    const positionParams = {
      column,
      rowNode: node,
      type: "contextMenu",
      mouseEvent,
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
      closedCallback: (e) => {
        eGridBodyGui.classList.remove(CSS_CONTEXT_MENU_OPEN);
        this.destroyBean(menu);
        this.dispatchVisibleChangedEvent(false, e === void 0 ? "api" : "ui");
      },
      click: mouseEvent,
      positionCallback: () => {
        const isRtl = this.gos.get("enableRtl");
        this.popupService.positionPopupUnderMouseEvent(__spreadProps(__spreadValues({}, positionParams), {
          nudgeX: isRtl ? (eMenuGui.offsetWidth + 1) * -1 : 1
        }));
      },
      // so when browser is scrolled down, or grid is scrolled, context menu stays with cell
      anchorToElement,
      ariaLabel: translate("ariaLabelContextMenu", "Context Menu")
    });
    if (addPopupRes) {
      eGridBodyGui.classList.add(CSS_CONTEXT_MENU_OPEN);
      menu.afterGuiAttached({ container: "contextMenu", hidePopup: addPopupRes.hideFunc });
    }
    if (this.activeMenu) {
      this.hideActiveMenu();
    }
    this.activeMenu = menu;
    menu.addEventListener(BeanStub2.EVENT_DESTROYED, () => {
      if (this.activeMenu === menu) {
        this.activeMenu = null;
      }
    });
    if (addPopupRes) {
      menu.addEventListener(AgMenuItemComponent2.EVENT_CLOSE_MENU, (e) => {
        var _a, _b;
        return addPopupRes.hideFunc({
          mouseEvent: (_a = e.mouseEvent) != null ? _a : void 0,
          keyboardEvent: (_b = e.keyboardEvent) != null ? _b : void 0,
          forceHide: true
        });
      });
    }
    const isApi = mouseEvent && mouseEvent instanceof MouseEvent && mouseEvent.type === "mousedown";
    this.dispatchVisibleChangedEvent(true, isApi ? "api" : "ui");
    return true;
  }
  dispatchVisibleChangedEvent(visible, source = "ui") {
    const displayedEvent = {
      type: Events2.EVENT_CONTEXT_MENU_VISIBLE_CHANGED,
      visible,
      source
    };
    this.eventService.dispatchEvent(displayedEvent);
  }
};
__decorateClass([
  Autowired2("popupService")
], ContextMenuFactory.prototype, "popupService", 2);
__decorateClass([
  Autowired2("ctrlsService")
], ContextMenuFactory.prototype, "ctrlsService", 2);
__decorateClass([
  Autowired2("columnModel")
], ContextMenuFactory.prototype, "columnModel", 2);
__decorateClass([
  Autowired2("menuUtils")
], ContextMenuFactory.prototype, "menuUtils", 2);
__decorateClass([
  Optional("rangeService")
], ContextMenuFactory.prototype, "rangeService", 2);
ContextMenuFactory = __decorateClass([
  Bean2("contextMenuFactory")
], ContextMenuFactory);
var ContextMenu = class extends Component2 {
  constructor(menuItems, column, node, value) {
    super(
      /* html */
      `<div class="${CSS_MENU}" role="presentation"></div>`
    );
    this.menuItems = menuItems;
    this.column = column;
    this.node = node;
    this.value = value;
    this.menuList = null;
    this.focusedCell = null;
  }
  addMenuItems() {
    const menuList = this.createManagedBean(new AgMenuList2(0, {
      column: this.column,
      node: this.node,
      value: this.value
    }));
    const menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null, () => this.getGui());
    menuList.addMenuItems(menuItemsMapped);
    this.appendChild(menuList);
    this.menuList = menuList;
    menuList.addEventListener(AgMenuItemComponent2.EVENT_CLOSE_MENU, (e) => this.dispatchEvent(e));
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
      const doc = this.gos.getDocument();
      const activeEl = this.gos.getActiveDomElement();
      if (!activeEl || activeEl === doc.body) {
        this.focusService.setFocusedCell({
          rowIndex,
          column,
          rowPinned,
          forceBrowserFocus: true,
          preventScrollOnBrowserFocus: !this.focusService.isKeyboardMode()
        });
      }
    }
  }
  destroy() {
    this.restoreFocusedCell();
    super.destroy();
  }
};
__decorateClass([
  Autowired2("menuItemMapper")
], ContextMenu.prototype, "menuItemMapper", 2);
__decorateClass([
  Autowired2("focusService")
], ContextMenu.prototype, "focusService", 2);
__decorateClass([
  Autowired2("cellPositionUtils")
], ContextMenu.prototype, "cellPositionUtils", 2);
__decorateClass([
  PostConstruct2
], ContextMenu.prototype, "addMenuItems", 1);

// enterprise-modules/menu/src/menu/menuItemMapper.ts
import {
  _ as _3,
  Autowired as Autowired3,
  Bean as Bean3,
  BeanStub as BeanStub3,
  ModuleNames as ModuleNames3,
  ModuleRegistry as ModuleRegistry3,
  Optional as Optional2
} from "@ag-grid-community/core";
var MenuItemMapper = class extends BeanStub3 {
  mapWithStockItems(originalList, column, sourceElement) {
    if (!originalList) {
      return [];
    }
    const resultList = [];
    originalList.forEach((menuItemOrString) => {
      let result;
      if (typeof menuItemOrString === "string") {
        result = this.getStockMenuItem(menuItemOrString, column, sourceElement);
      } else {
        result = __spreadValues({}, menuItemOrString);
      }
      if (!result) {
        return;
      }
      const resultDef = result;
      const { subMenu } = resultDef;
      if (subMenu && subMenu instanceof Array) {
        resultDef.subMenu = this.mapWithStockItems(subMenu, column, sourceElement);
      }
      if (result != null) {
        resultList.push(result);
      }
    });
    return resultList;
  }
  getStockMenuItem(key, column, sourceElement) {
    var _a;
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const skipHeaderOnAutoSize = this.gos.get("skipHeaderOnAutoSize");
    switch (key) {
      case "pinSubMenu":
        return {
          name: localeTextFunc("pinColumn", "Pin Column"),
          icon: _3.createIconNoSpan("menuPin", this.gos, null),
          subMenu: ["clearPinned", "pinLeft", "pinRight"]
        };
      case "pinLeft":
        return {
          name: localeTextFunc("pinLeft", "Pin Left"),
          action: () => this.columnModel.setColumnsPinned([column], "left", "contextMenu"),
          checked: !!column && column.isPinnedLeft()
        };
      case "pinRight":
        return {
          name: localeTextFunc("pinRight", "Pin Right"),
          action: () => this.columnModel.setColumnsPinned([column], "right", "contextMenu"),
          checked: !!column && column.isPinnedRight()
        };
      case "clearPinned":
        return {
          name: localeTextFunc("noPin", "No Pin"),
          action: () => this.columnModel.setColumnsPinned([column], null, "contextMenu"),
          checked: !!column && !column.isPinned()
        };
      case "valueAggSubMenu":
        if (ModuleRegistry3.__assertRegistered(ModuleNames3.RowGroupingModule, "Aggregation from Menu", this.context.getGridId())) {
          if (!(column == null ? void 0 : column.isPrimary()) && !(column == null ? void 0 : column.getColDef().pivotValueColumn)) {
            return null;
          }
          return {
            name: localeTextFunc("valueAggregation", "Value Aggregation"),
            icon: _3.createIconNoSpan("menuValue", this.gos, null),
            subMenu: this.createAggregationSubMenu(column, this.aggFuncService)
          };
        } else {
          return null;
        }
      case "autoSizeThis":
        return {
          name: localeTextFunc("autosizeThiscolumn", "Autosize This Column"),
          action: () => this.columnModel.autoSizeColumn(column, "contextMenu", skipHeaderOnAutoSize)
        };
      case "autoSizeAll":
        return {
          name: localeTextFunc("autosizeAllColumns", "Autosize All Columns"),
          action: () => this.columnModel.autoSizeAllColumns("contextMenu", skipHeaderOnAutoSize)
        };
      case "rowGroup":
        return {
          name: localeTextFunc("groupBy", "Group by") + " " + _3.escapeString(this.columnModel.getDisplayNameForColumn(column, "header")),
          disabled: (column == null ? void 0 : column.isRowGroupActive()) || !(column == null ? void 0 : column.getColDef().enableRowGroup),
          action: () => this.columnModel.addRowGroupColumns([column], "contextMenu"),
          icon: _3.createIconNoSpan("menuAddRowGroup", this.gos, null)
        };
      case "rowUnGroup":
        const icon = _3.createIconNoSpan("menuRemoveRowGroup", this.gos, null);
        const showRowGroup = column == null ? void 0 : column.getColDef().showRowGroup;
        const lockedGroups = this.gos.get("groupLockGroupColumns");
        if (showRowGroup === true) {
          return {
            name: localeTextFunc("ungroupAll", "Un-Group All"),
            disabled: lockedGroups === -1 || lockedGroups >= this.columnModel.getRowGroupColumns().length,
            action: () => this.columnModel.setRowGroupColumns(this.columnModel.getRowGroupColumns().slice(0, lockedGroups), "contextMenu"),
            icon
          };
        }
        if (typeof showRowGroup === "string") {
          const underlyingColumn = this.columnModel.getPrimaryColumn(showRowGroup);
          const ungroupByName = underlyingColumn != null ? _3.escapeString(this.columnModel.getDisplayNameForColumn(underlyingColumn, "header")) : showRowGroup;
          return {
            name: localeTextFunc("ungroupBy", "Un-Group by") + " " + ungroupByName,
            disabled: underlyingColumn != null && this.columnModel.isColumnGroupingLocked(underlyingColumn),
            action: () => this.columnModel.removeRowGroupColumns([showRowGroup], "contextMenu"),
            icon
          };
        }
        return {
          name: localeTextFunc("ungroupBy", "Un-Group by") + " " + _3.escapeString(this.columnModel.getDisplayNameForColumn(column, "header")),
          disabled: !(column == null ? void 0 : column.isRowGroupActive()) || !(column == null ? void 0 : column.getColDef().enableRowGroup) || this.columnModel.isColumnGroupingLocked(column),
          action: () => this.columnModel.removeRowGroupColumns([column], "contextMenu"),
          icon
        };
      case "resetColumns":
        return {
          name: localeTextFunc("resetColumns", "Reset Columns"),
          action: () => this.columnModel.resetColumnState("contextMenu")
        };
      case "expandAll":
        return {
          name: localeTextFunc("expandAll", "Expand All Row Groups"),
          action: () => this.gridApi.expandAll()
        };
      case "contractAll":
        return {
          name: localeTextFunc("collapseAll", "Collapse All Row Groups"),
          action: () => this.gridApi.collapseAll()
        };
      case "copy":
        if (ModuleRegistry3.__assertRegistered(ModuleNames3.ClipboardModule, "Copy from Menu", this.context.getGridId())) {
          return {
            name: localeTextFunc("copy", "Copy"),
            shortcut: localeTextFunc("ctrlC", "Ctrl+C"),
            icon: _3.createIconNoSpan("clipboardCopy", this.gos, null),
            action: () => this.clipboardService.copyToClipboard()
          };
        } else {
          return null;
        }
      case "copyWithHeaders":
        if (ModuleRegistry3.__assertRegistered(ModuleNames3.ClipboardModule, "Copy with Headers from Menu", this.context.getGridId())) {
          return {
            name: localeTextFunc("copyWithHeaders", "Copy with Headers"),
            // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
            icon: _3.createIconNoSpan("clipboardCopy", this.gos, null),
            action: () => this.clipboardService.copyToClipboard({ includeHeaders: true })
          };
        } else {
          return null;
        }
      case "copyWithGroupHeaders":
        if (ModuleRegistry3.__assertRegistered(ModuleNames3.ClipboardModule, "Copy with Group Headers from Menu", this.context.getGridId())) {
          return {
            name: localeTextFunc("copyWithGroupHeaders", "Copy with Group Headers"),
            // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
            icon: _3.createIconNoSpan("clipboardCopy", this.gos, null),
            action: () => this.clipboardService.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true })
          };
        } else {
          return null;
        }
      case "cut":
        if (ModuleRegistry3.__assertRegistered(ModuleNames3.ClipboardModule, "Cut from Menu", this.context.getGridId())) {
          const focusedCell = this.focusService.getFocusedCell();
          const rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
          const isEditable = rowNode ? focusedCell == null ? void 0 : focusedCell.column.isCellEditable(rowNode) : false;
          return {
            name: localeTextFunc("cut", "Cut"),
            shortcut: localeTextFunc("ctrlX", "Ctrl+X"),
            icon: _3.createIconNoSpan("clipboardCut", this.gos, null),
            disabled: !isEditable || this.gos.get("suppressCutToClipboard"),
            action: () => this.clipboardService.cutToClipboard(void 0, "contextMenu")
          };
        } else {
          return null;
        }
      case "paste":
        if (ModuleRegistry3.__assertRegistered(ModuleNames3.ClipboardModule, "Paste from Clipboard", this.context.getGridId())) {
          return {
            name: localeTextFunc("paste", "Paste"),
            shortcut: localeTextFunc("ctrlV", "Ctrl+V"),
            disabled: true,
            icon: _3.createIconNoSpan("clipboardPaste", this.gos, null),
            action: () => this.clipboardService.pasteFromClipboard()
          };
        } else {
          return null;
        }
      case "export":
        const exportSubMenuItems = [];
        const csvModuleLoaded = ModuleRegistry3.__isRegistered(ModuleNames3.CsvExportModule, this.context.getGridId());
        const excelModuleLoaded = ModuleRegistry3.__isRegistered(ModuleNames3.ExcelExportModule, this.context.getGridId());
        if (!this.gos.get("suppressCsvExport") && csvModuleLoaded) {
          exportSubMenuItems.push("csvExport");
        }
        if (!this.gos.get("suppressExcelExport") && excelModuleLoaded) {
          exportSubMenuItems.push("excelExport");
        }
        return {
          name: localeTextFunc("export", "Export"),
          subMenu: exportSubMenuItems,
          icon: _3.createIconNoSpan("save", this.gos, null)
        };
      case "csvExport":
        return {
          name: localeTextFunc("csvExport", "CSV Export"),
          icon: _3.createIconNoSpan("csvExport", this.gos, null),
          action: () => this.gridApi.exportDataAsCsv({})
        };
      case "excelExport":
        return {
          name: localeTextFunc("excelExport", "Excel Export"),
          icon: _3.createIconNoSpan("excelExport", this.gos, null),
          action: () => this.gridApi.exportDataAsExcel()
        };
      case "separator":
        return "separator";
      case "pivotChart":
      case "chartRange":
        return (_a = this.chartMenuItemMapper.getChartItems(key)) != null ? _a : null;
      case "columnFilter":
        if (column) {
          return {
            name: localeTextFunc("columnFilter", "Column Filter"),
            icon: _3.createIconNoSpan("filter", this.gos, null),
            action: () => this.menuService.showFilterMenu({
              column,
              buttonElement: sourceElement(),
              containerType: "columnFilter",
              positionBy: "button"
            })
          };
        } else {
          return null;
        }
      case "columnChooser":
        if (ModuleRegistry3.__isRegistered(ModuleNames3.ColumnsToolPanelModule, this.context.getGridId())) {
          return {
            name: localeTextFunc("columnChooser", "Choose Columns"),
            icon: _3.createIconNoSpan("columns", this.gos, null),
            action: () => this.menuService.showColumnChooser({ column, eventSource: sourceElement() })
          };
        } else {
          return null;
        }
      case "sortAscending":
        return {
          name: localeTextFunc("sortAscending", "Sort Ascending"),
          icon: _3.createIconNoSpan("sortAscending", this.gos, null),
          action: () => this.sortController.setSortForColumn(column, "asc", false, "columnMenu")
        };
      case "sortDescending":
        return {
          name: localeTextFunc("sortDescending", "Sort Descending"),
          icon: _3.createIconNoSpan("sortDescending", this.gos, null),
          action: () => this.sortController.setSortForColumn(column, "desc", false, "columnMenu")
        };
      case "sortUnSort":
        return {
          name: localeTextFunc("sortUnSort", "Clear Sort"),
          icon: _3.createIconNoSpan("sortUnSort", this.gos, null),
          action: () => this.sortController.setSortForColumn(column, null, false, "columnMenu")
        };
      default: {
        console.warn(`AG Grid: unknown menu item type ${key}`);
        return null;
      }
    }
  }
  createAggregationSubMenu(column, aggFuncService) {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    let columnToUse;
    if (column.isPrimary()) {
      columnToUse = column;
    } else {
      const pivotValueColumn = column.getColDef().pivotValueColumn;
      columnToUse = _3.exists(pivotValueColumn) ? pivotValueColumn : void 0;
    }
    const result = [];
    if (columnToUse) {
      const columnIsAlreadyAggValue = columnToUse.isValueActive();
      const funcNames = aggFuncService.getFuncNames(columnToUse);
      result.push({
        name: localeTextFunc("noAggregation", "None"),
        action: () => {
          this.columnModel.removeValueColumns([columnToUse], "contextMenu");
          this.columnModel.setColumnAggFunc(columnToUse, void 0, "contextMenu");
        },
        checked: !columnIsAlreadyAggValue
      });
      funcNames.forEach((funcName) => {
        result.push({
          name: localeTextFunc(funcName, aggFuncService.getDefaultFuncLabel(funcName)),
          action: () => {
            this.columnModel.setColumnAggFunc(columnToUse, funcName, "contextMenu");
            this.columnModel.addValueColumns([columnToUse], "contextMenu");
          },
          checked: columnIsAlreadyAggValue && columnToUse.getAggFunc() === funcName
        });
      });
    }
    return result;
  }
};
__decorateClass([
  Autowired3("columnModel")
], MenuItemMapper.prototype, "columnModel", 2);
__decorateClass([
  Autowired3("gridApi")
], MenuItemMapper.prototype, "gridApi", 2);
__decorateClass([
  Autowired3("focusService")
], MenuItemMapper.prototype, "focusService", 2);
__decorateClass([
  Autowired3("rowPositionUtils")
], MenuItemMapper.prototype, "rowPositionUtils", 2);
__decorateClass([
  Autowired3("chartMenuItemMapper")
], MenuItemMapper.prototype, "chartMenuItemMapper", 2);
__decorateClass([
  Autowired3("menuService")
], MenuItemMapper.prototype, "menuService", 2);
__decorateClass([
  Autowired3("sortController")
], MenuItemMapper.prototype, "sortController", 2);
__decorateClass([
  Optional2("clipboardService")
], MenuItemMapper.prototype, "clipboardService", 2);
__decorateClass([
  Optional2("aggFuncService")
], MenuItemMapper.prototype, "aggFuncService", 2);
MenuItemMapper = __decorateClass([
  Bean3("menuItemMapper")
], MenuItemMapper);

// enterprise-modules/menu/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/menu/src/menu/chartMenuItemMapper.ts
import { Bean as Bean4, BeanStub as BeanStub4, ModuleNames as ModuleNames4, ModuleRegistry as ModuleRegistry4, Optional as Optional3, _ as _4 } from "@ag-grid-community/core";
var ChartMenuItemMapper = class extends BeanStub4 {
  getChartItems(key) {
    var _a, _b;
    if (!this.chartService) {
      ModuleRegistry4.__assertRegistered(ModuleNames4.GridChartsModule, `the Context Menu key "${key}"`, this.context.getGridId());
      return void 0;
    }
    const builder = key === "pivotChart" ? new PivotMenuItemMapper(this.gos, this.chartService, this.localeService) : new RangeMenuItemMapper(this.gos, this.chartService, this.localeService);
    const isEnterprise = this.chartService.isEnterprise();
    let topLevelMenuItem = builder.getMenuItem();
    if (topLevelMenuItem && topLevelMenuItem.subMenu && !isEnterprise) {
      const filterEnterpriseItems = (m) => {
        var _a2;
        return __spreadProps(__spreadValues({}, m), {
          subMenu: (_a2 = m.subMenu) == null ? void 0 : _a2.filter((menu) => !menu._enterprise).map((menu) => filterEnterpriseItems(menu))
        });
      };
      topLevelMenuItem = filterEnterpriseItems(topLevelMenuItem);
    }
    const chartGroupsDef = (_b = (_a = this.gos.get("chartToolPanelsDef")) == null ? void 0 : _a.settingsPanel) == null ? void 0 : _b.chartGroupsDef;
    if (chartGroupsDef) {
      topLevelMenuItem = ChartMenuItemMapper.filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, builder.getConfigLookup());
    }
    return this.cleanInternals(topLevelMenuItem);
  }
  // Remove our internal _key and _enterprise properties so this does not leak out of the class on the menu items.
  cleanInternals(menuItem) {
    if (!menuItem) {
      return menuItem;
    }
    const removeKeys = (m) => {
      var _a;
      m == null ? true : delete m._key;
      m == null ? true : delete m._enterprise;
      (_a = m == null ? void 0 : m.subMenu) == null ? void 0 : _a.forEach((s) => removeKeys(s));
      return m;
    };
    return removeKeys(menuItem);
  }
  static buildLookup(menuItem) {
    let itemLookup = {};
    const addItem = (item) => {
      itemLookup[item._key] = item;
      if (item.subMenu) {
        item.subMenu.forEach((s) => addItem(s));
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
    let orderedAndFiltered = __spreadProps(__spreadValues({}, topLevelMenuItem), { subMenu: [] });
    Object.entries(chartGroupsDef).forEach(([group, chartTypes]) => {
      var _a2, _b;
      const chartConfigGroup = configLookup[group];
      if (chartConfigGroup === null)
        return;
      if (chartConfigGroup == void 0) {
        _4.warnOnce(`invalid chartGroupsDef config '${group}'`);
        return void 0;
      }
      const menuItem = menuItemLookup[chartConfigGroup._key];
      if (menuItem) {
        if (menuItem.subMenu) {
          const subMenus = chartTypes.map((chartType) => {
            const itemKey = chartConfigGroup[chartType];
            if (itemKey == void 0) {
              _4.warnOnce(`invalid chartGroupsDef config '${group}.${chartType}'`);
              return void 0;
            }
            return menuItemLookup[itemKey];
          }).filter((s) => s !== void 0);
          if (subMenus.length > 0) {
            menuItem.subMenu = subMenus;
            (_a2 = orderedAndFiltered.subMenu) == null ? void 0 : _a2.push(menuItem);
          }
        } else {
          (_b = orderedAndFiltered.subMenu) == null ? void 0 : _b.push(menuItem);
        }
      }
    });
    if (((_a = orderedAndFiltered.subMenu) == null ? void 0 : _a.length) == 0) {
      return void 0;
    }
    return orderedAndFiltered;
  }
};
__decorateClass([
  Optional3("chartService")
], ChartMenuItemMapper.prototype, "chartService", 2);
ChartMenuItemMapper = __decorateClass([
  Bean4("chartMenuItemMapper")
], ChartMenuItemMapper);
var PivotMenuItemMapper = class {
  constructor(gos, chartService, localeService) {
    this.gos = gos;
    this.chartService = chartService;
    this.localeService = localeService;
  }
  getMenuItem() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const getMenuItem = (localeKey, defaultText, chartType, key, enterprise = false) => {
      return {
        name: localeTextFunc(localeKey, defaultText),
        action: () => this.chartService.createPivotChart({ chartType }),
        _key: key,
        _enterprise: enterprise
      };
    };
    return {
      name: localeTextFunc("pivotChart", "Pivot Chart"),
      _key: "pivotChart",
      subMenu: [
        {
          _key: "pivotColumnChart",
          name: localeTextFunc("columnChart", "Column"),
          subMenu: [
            getMenuItem("groupedColumn", "Grouped&lrm;", "groupedColumn", "pivotGroupedColumn"),
            getMenuItem("stackedColumn", "Stacked&lrm;", "stackedColumn", "pivotStackedColumn"),
            getMenuItem("normalizedColumn", "100% Stacked&lrm;", "normalizedColumn", "pivotNormalizedColumn")
          ]
        },
        {
          _key: "pivotBarChart",
          name: localeTextFunc("barChart", "Bar"),
          subMenu: [
            getMenuItem("groupedBar", "Grouped&lrm;", "groupedBar", "pivotGroupedBar"),
            getMenuItem("stackedBar", "Stacked&lrm;", "stackedBar", "pivotStackedBar"),
            getMenuItem("normalizedBar", "100% Stacked&lrm;", "normalizedBar", "pivotNormalizedBar")
          ]
        },
        {
          _key: "pivotPieChart",
          name: localeTextFunc("pieChart", "Pie"),
          subMenu: [
            getMenuItem("pie", "Pie&lrm;", "pie", "pivotPie"),
            getMenuItem("donut", "Donut&lrm;", "donut", "pivotDonut")
          ]
        },
        getMenuItem("line", "Line&lrm;", "line", "pivotLineChart"),
        {
          _key: "pivotXYChart",
          name: localeTextFunc("xyChart", "X Y (Scatter)"),
          subMenu: [
            getMenuItem("scatter", "Scatter&lrm;", "scatter", "pivotScatter"),
            getMenuItem("bubble", "Bubble&lrm;", "bubble", "pivotBubble")
          ]
        },
        {
          _key: "pivotAreaChart",
          name: localeTextFunc("areaChart", "Area"),
          subMenu: [
            getMenuItem("area", "Area&lrm;", "area", "pivotArea"),
            getMenuItem("stackedArea", "Stacked&lrm;", "stackedArea", "pivotStackedArea"),
            getMenuItem("normalizedArea", "100% Stacked&lrm;", "normalizedArea", "pivotNormalizedArea")
          ]
        },
        {
          _key: "pivotStatisticalChart",
          _enterprise: false,
          // histogram chart is available in both community and enterprise distributions
          name: localeTextFunc("statisticalChart", "Statistical"),
          subMenu: [
            getMenuItem("histogramChart", "Histogram&lrm;", "histogram", "pivotHistogram", false)
          ]
        },
        {
          _key: "pivotHierarchicalChart",
          _enterprise: true,
          name: localeTextFunc("hierarchicalChart", "Hierarchical"),
          subMenu: [
            getMenuItem("treemapChart", "Treemap&lrm;", "treemap", "pivotTreemap", true),
            getMenuItem("sunburstChart", "Sunburst&lrm;", "sunburst", "pivotSunburst", true)
          ]
        },
        {
          _key: "pivotCombinationChart",
          name: localeTextFunc("combinationChart", "Combination"),
          subMenu: [
            getMenuItem("columnLineCombo", "Column & Line&lrm;", "columnLineCombo", "pivotColumnLineCombo"),
            getMenuItem("AreaColumnCombo", "Area & Column&lrm;", "areaColumnCombo", "pivotAreaColumnCombo")
          ]
        }
      ],
      icon: _4.createIconNoSpan("chart", this.gos, void 0)
    };
  }
  getConfigLookup() {
    return {
      columnGroup: {
        _key: "pivotColumnChart",
        column: "pivotGroupedColumn",
        stackedColumn: "pivotStackedColumn",
        normalizedColumn: "pivotNormalizedColumn"
      },
      barGroup: {
        _key: "pivotBarChart",
        bar: "pivotGroupedBar",
        stackedBar: "pivotStackedBar",
        normalizedBar: "pivotNormalizedBar"
      },
      pieGroup: {
        _key: "pivotPieChart",
        pie: "pivotPie",
        donut: "pivotDonut",
        doughnut: "pivotDonut"
      },
      lineGroup: {
        _key: "pivotLineChart",
        line: "pivotLineChart"
      },
      scatterGroup: {
        _key: "pivotXYChart",
        bubble: "pivotBubble",
        scatter: "pivotScatter"
      },
      areaGroup: {
        _key: "pivotAreaChart",
        area: "pivotArea",
        stackedArea: "pivotStackedArea",
        normalizedArea: "pivotNormalizedArea"
      },
      combinationGroup: {
        _key: "pivotCombinationChart",
        columnLineCombo: "pivotColumnLineCombo",
        areaColumnCombo: "pivotAreaColumnCombo",
        customCombo: null
        // Not currently supported
      },
      hierarchicalGroup: {
        _key: "pivotHierarchicalChart",
        treemap: "pivotTreemap",
        sunburst: "pivotSunburst"
      },
      statisticalGroup: {
        _key: "pivotStatisticalChart",
        histogram: "pivotHistogram",
        // Some statistical charts do not currently support pivot mode
        rangeBar: null,
        rangeArea: null,
        boxPlot: null
      },
      // Polar charts do not support pivot mode
      polarGroup: null,
      // Specialized charts do not currently support pivot mode
      specializedGroup: null
    };
  }
};
var RangeMenuItemMapper = class {
  constructor(gos, chartService, localeService) {
    this.gos = gos;
    this.chartService = chartService;
    this.localeService = localeService;
  }
  getMenuItem() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const getMenuItem = (localeKey, defaultText, chartType, key, enterprise = false) => {
      return {
        name: localeTextFunc(localeKey, defaultText),
        action: () => this.chartService.createChartFromCurrentRange(chartType),
        _key: key,
        _enterprise: enterprise
      };
    };
    return {
      name: localeTextFunc("chartRange", "Chart Range"),
      _key: "chartRange",
      subMenu: [
        {
          name: localeTextFunc("columnChart", "Column"),
          subMenu: [
            getMenuItem("groupedColumn", "Grouped&lrm;", "groupedColumn", "rangeGroupedColumn"),
            getMenuItem("stackedColumn", "Stacked&lrm;", "stackedColumn", "rangeStackedColumn"),
            getMenuItem("normalizedColumn", "100% Stacked&lrm;", "normalizedColumn", "rangeNormalizedColumn")
          ],
          _key: "rangeColumnChart"
        },
        {
          name: localeTextFunc("barChart", "Bar"),
          subMenu: [
            getMenuItem("groupedBar", "Grouped&lrm;", "groupedBar", "rangeGroupedBar"),
            getMenuItem("stackedBar", "Stacked&lrm;", "stackedBar", "rangeStackedBar"),
            getMenuItem("normalizedBar", "100% Stacked&lrm;", "normalizedBar", "rangeNormalizedBar")
          ],
          _key: "rangeBarChart"
        },
        {
          name: localeTextFunc("pieChart", "Pie"),
          subMenu: [
            getMenuItem("pie", "Pie&lrm;", "pie", "rangePie"),
            getMenuItem("donut", "Donut&lrm;", "donut", "rangeDonut")
          ],
          _key: "rangePieChart"
        },
        getMenuItem("line", "Line&lrm;", "line", "rangeLineChart"),
        {
          name: localeTextFunc("xyChart", "X Y (Scatter)"),
          subMenu: [
            getMenuItem("scatter", "Scatter&lrm;", "scatter", "rangeScatter"),
            getMenuItem("bubble", "Bubble&lrm;", "bubble", "rangeBubble")
          ],
          _key: "rangeXYChart"
        },
        {
          name: localeTextFunc("areaChart", "Area"),
          subMenu: [
            getMenuItem("area", "Area&lrm;", "area", "rangeArea"),
            getMenuItem("stackedArea", "Stacked&lrm;", "stackedArea", "rangeStackedArea"),
            getMenuItem("normalizedArea", "100% Stacked&lrm;", "normalizedArea", "rangeNormalizedArea")
          ],
          _key: "rangeAreaChart"
        },
        {
          name: localeTextFunc("polarChart", "Polar"),
          subMenu: [
            getMenuItem("radarLine", "Radar Line&lrm;", "radarLine", "rangeRadarLine"),
            getMenuItem("radarArea", "Radar Area&lrm;", "radarArea", "rangeRadarArea"),
            getMenuItem("nightingale", "Nightingale&lrm;", "nightingale", "rangeNightingale"),
            getMenuItem("radialColumn", "Radial Column&lrm;", "radialColumn", "rangeRadialColumn"),
            getMenuItem("radialBar", "Radial Bar&lrm;", "radialBar", "rangeRadialBar")
          ],
          _key: "rangePolarChart",
          _enterprise: true
        },
        {
          name: localeTextFunc("statisticalChart", "Statistical"),
          subMenu: [
            getMenuItem("boxPlot", "Box Plot&lrm;", "boxPlot", "rangeBoxPlot", true),
            getMenuItem("histogramChart", "Histogram&lrm;", "histogram", "rangeHistogram", false),
            getMenuItem("rangeBar", "Range Bar&lrm;", "rangeBar", "rangeRangeBar", true),
            getMenuItem("rangeArea", "Range Area&lrm;", "rangeArea", "rangeRangeArea", true)
          ],
          _key: "rangeStatisticalChart",
          _enterprise: false
          // histogram chart is available in both community and enterprise distributions
        },
        {
          name: localeTextFunc("hierarchicalChart", "Hierarchical"),
          subMenu: [
            getMenuItem("treemap", "Treemap&lrm;", "treemap", "rangeTreemap"),
            getMenuItem("sunburst", "Sunburst&lrm;", "sunburst", "rangeSunburst")
          ],
          _key: "rangeHierarchicalChart",
          _enterprise: true
        },
        {
          name: localeTextFunc("specializedChart", "Specialized"),
          subMenu: [
            getMenuItem("heatmap", "Heatmap&lrm;", "heatmap", "rangeHeatmap"),
            getMenuItem("waterfall", "Waterfall&lrm;", "waterfall", "rangeWaterfall")
          ],
          _key: "rangeSpecializedChart",
          _enterprise: true
        },
        {
          name: localeTextFunc("combinationChart", "Combination"),
          subMenu: [
            getMenuItem("columnLineCombo", "Column & Line&lrm;", "columnLineCombo", "rangeColumnLineCombo"),
            getMenuItem("AreaColumnCombo", "Area & Column&lrm;", "areaColumnCombo", "rangeAreaColumnCombo")
          ],
          _key: "rangeCombinationChart"
        }
      ],
      icon: _4.createIconNoSpan("chart", this.gos, void 0)
    };
  }
  getConfigLookup() {
    return {
      columnGroup: {
        _key: "rangeColumnChart",
        column: "rangeGroupedColumn",
        stackedColumn: "rangeStackedColumn",
        normalizedColumn: "rangeNormalizedColumn"
      },
      barGroup: {
        _key: "rangeBarChart",
        bar: "rangeGroupedBar",
        stackedBar: "rangeStackedBar",
        normalizedBar: "rangeNormalizedBar"
      },
      pieGroup: {
        _key: "rangePieChart",
        pie: "rangePie",
        donut: "rangeDonut",
        doughnut: "rangeDonut"
      },
      lineGroup: {
        _key: "rangeLineChart",
        line: "rangeLineChart"
      },
      scatterGroup: {
        _key: "rangeXYChart",
        bubble: "rangeBubble",
        scatter: "rangeScatter"
      },
      areaGroup: {
        _key: "rangeAreaChart",
        area: "rangeArea",
        stackedArea: "rangeStackedArea",
        normalizedArea: "rangeNormalizedArea"
      },
      polarGroup: {
        _key: "rangePolarChart",
        radarLine: "rangeRadarLine",
        radarArea: "rangeRadarArea",
        nightingale: "rangeNightingale",
        radialColumn: "rangeRadialColumn",
        radialBar: "rangeRadialBar"
      },
      statisticalGroup: {
        _key: "rangeStatisticalChart",
        boxPlot: "rangeBoxPlot",
        histogram: "rangeHistogram",
        rangeBar: "rangeRangeBar",
        rangeArea: "rangeRangeArea"
      },
      hierarchicalGroup: {
        _key: "rangeHierarchicalChart",
        treemap: "rangeTreemap",
        sunburst: "rangeSunburst"
      },
      specializedGroup: {
        _key: "rangeSpecializedChart",
        heatmap: "rangeHeatmap",
        waterfall: "rangeWaterfall"
      },
      combinationGroup: {
        _key: "rangeCombinationChart",
        columnLineCombo: "rangeColumnLineCombo",
        areaColumnCombo: "rangeAreaColumnCombo",
        customCombo: null
        // Not currently supported
      }
    };
  }
};

// enterprise-modules/menu/src/menu/columnChooserFactory.ts
import {
  AgDialog,
  Autowired as Autowired4,
  Bean as Bean5,
  BeanStub as BeanStub5,
  Events as Events3
} from "@ag-grid-community/core";
import { PrimaryColsPanel } from "@ag-grid-enterprise/column-tool-panel";
var ColumnChooserFactory = class extends BeanStub5 {
  createColumnSelectPanel(parent, column, draggable, params) {
    var _a, _b;
    const columnSelectPanel = parent.createManagedBean(new PrimaryColsPanel());
    const columnChooserParams = (_b = (_a = params != null ? params : column == null ? void 0 : column.getColDef().columnChooserParams) != null ? _a : column == null ? void 0 : column.getColDef().columnsMenuParams) != null ? _b : {};
    const {
      contractColumnSelection,
      suppressColumnExpandAll,
      suppressColumnFilter,
      suppressColumnSelectAll,
      suppressSyncLayoutWithGrid,
      columnLayout
    } = columnChooserParams;
    columnSelectPanel.init(!!draggable, this.gos.addGridCommonParams({
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
      onStateUpdated: () => {
      }
    }), "columnMenu");
    if (columnLayout) {
      columnSelectPanel.setColumnLayout(columnLayout);
    }
    return columnSelectPanel;
  }
  showColumnChooser({ column, chooserParams, eventSource }) {
    this.hideActiveColumnChooser();
    const columnSelectPanel = this.createColumnSelectPanel(this, column, true, chooserParams);
    const translate = this.localeService.getLocaleTextFunc();
    const columnIndex = this.columnModel.getAllDisplayedColumns().indexOf(column);
    const headerPosition = column ? this.focusService.getFocusedHeader() : null;
    this.activeColumnChooserDialog = this.createBean(new AgDialog({
      title: translate("chooseColumns", "Choose Columns"),
      component: columnSelectPanel,
      width: 300,
      height: 300,
      resizable: true,
      movable: true,
      centered: true,
      closable: true,
      afterGuiAttached: () => {
        var _a;
        (_a = this.focusService.findNextFocusableElement(columnSelectPanel.getGui())) == null ? void 0 : _a.focus();
        this.dispatchVisibleChangedEvent(true, column);
      },
      closedCallback: (event) => {
        const eComp = this.activeColumnChooser.getGui();
        this.destroyBean(this.activeColumnChooser);
        this.activeColumnChooser = void 0;
        this.activeColumnChooserDialog = void 0;
        this.dispatchVisibleChangedEvent(false, column);
        if (column) {
          this.menuUtils.restoreFocusOnClose({ column, headerPosition, columnIndex, eventSource }, eComp, event, true);
        }
      }
    }));
    this.activeColumnChooser = columnSelectPanel;
  }
  hideActiveColumnChooser() {
    if (this.activeColumnChooserDialog) {
      this.destroyBean(this.activeColumnChooserDialog);
    }
  }
  dispatchVisibleChangedEvent(visible, column) {
    const event = {
      type: Events3.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
      visible,
      switchingTab: false,
      key: "columnChooser",
      column: column != null ? column : null
    };
    this.eventService.dispatchEvent(event);
  }
};
__decorateClass([
  Autowired4("focusService")
], ColumnChooserFactory.prototype, "focusService", 2);
__decorateClass([
  Autowired4("menuUtils")
], ColumnChooserFactory.prototype, "menuUtils", 2);
__decorateClass([
  Autowired4("columnModel")
], ColumnChooserFactory.prototype, "columnModel", 2);
ColumnChooserFactory = __decorateClass([
  Bean5("columnChooserFactory")
], ColumnChooserFactory);

// enterprise-modules/menu/src/menu/columnMenuFactory.ts
import {
  AgMenuList as AgMenuList3,
  Autowired as Autowired5,
  Bean as Bean6,
  BeanStub as BeanStub6,
  _ as _5
} from "@ag-grid-community/core";
var ColumnMenuFactory = class extends BeanStub6 {
  createMenu(parent, column, sourceElement) {
    const menuList = parent.createManagedBean(new AgMenuList3(0, {
      column: column != null ? column : null,
      node: null,
      value: null
    }));
    const menuItems = this.getMenuItems(column);
    const menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, column != null ? column : null, sourceElement);
    menuList.addMenuItems(menuItemsMapped);
    return menuList;
  }
  getMenuItems(column) {
    const defaultItems = this.getDefaultMenuOptions(column);
    let result;
    const columnMainMenuItems = column == null ? void 0 : column.getColDef().mainMenuItems;
    if (Array.isArray(columnMainMenuItems)) {
      result = columnMainMenuItems;
    } else if (typeof columnMainMenuItems === "function") {
      result = columnMainMenuItems(this.gos.addGridCommonParams({
        column,
        defaultItems
      }));
    } else {
      const userFunc = this.gos.getCallback("getMainMenuItems");
      if (userFunc && column) {
        result = userFunc({
          column,
          defaultItems
        });
      } else {
        result = defaultItems;
      }
    }
    _5.removeRepeatsFromArray(result, ColumnMenuFactory.MENU_ITEM_SEPARATOR);
    return result;
  }
  getDefaultMenuOptions(column) {
    const result = [];
    const isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
    if (!column) {
      if (!isLegacyMenuEnabled) {
        result.push("columnChooser");
      }
      result.push("resetColumns");
      return result;
    }
    const allowPinning = !column.getColDef().lockPinned;
    const rowGroupCount = this.columnModel.getRowGroupColumns().length;
    const doingGrouping = rowGroupCount > 0;
    const allowValue = column.isAllowValue();
    const allowRowGroup = column.isAllowRowGroup();
    const isPrimary = column.isPrimary();
    const pivotModeOn = this.columnModel.isPivotMode();
    const isInMemoryRowModel = this.rowModel.getType() === "clientSide";
    const usingTreeData = this.gos.get("treeData");
    const allowValueAgg = (
      // if primary, then only allow aggValue if grouping and it's a value columns
      isPrimary && doingGrouping && allowValue || !isPrimary
    );
    if (!isLegacyMenuEnabled && column.isSortable()) {
      const sort = column.getSort();
      if (sort !== "asc") {
        result.push("sortAscending");
      }
      if (sort !== "desc") {
        result.push("sortDescending");
      }
      if (sort) {
        result.push("sortUnSort");
      }
      result.push(ColumnMenuFactory.MENU_ITEM_SEPARATOR);
    }
    if (this.menuService.isFilterMenuItemEnabled(column)) {
      result.push("columnFilter");
      result.push(ColumnMenuFactory.MENU_ITEM_SEPARATOR);
    }
    if (allowPinning) {
      result.push("pinSubMenu");
    }
    if (allowValueAgg) {
      result.push("valueAggSubMenu");
    }
    if (allowPinning || allowValueAgg) {
      result.push(ColumnMenuFactory.MENU_ITEM_SEPARATOR);
    }
    result.push("autoSizeThis");
    result.push("autoSizeAll");
    result.push(ColumnMenuFactory.MENU_ITEM_SEPARATOR);
    const showRowGroup = column.getColDef().showRowGroup;
    if (showRowGroup) {
      result.push("rowUnGroup");
    } else if (allowRowGroup && column.isPrimary()) {
      if (column.isRowGroupActive()) {
        const groupLocked = this.columnModel.isColumnGroupingLocked(column);
        if (!groupLocked) {
          result.push("rowUnGroup");
        }
      } else {
        result.push("rowGroup");
      }
    }
    result.push(ColumnMenuFactory.MENU_ITEM_SEPARATOR);
    if (!isLegacyMenuEnabled) {
      result.push("columnChooser");
    }
    result.push("resetColumns");
    const allowExpandAndContract = isInMemoryRowModel && (usingTreeData || rowGroupCount > (pivotModeOn ? 1 : 0));
    if (allowExpandAndContract) {
      result.push("expandAll");
      result.push("contractAll");
    }
    return result;
  }
};
ColumnMenuFactory.MENU_ITEM_SEPARATOR = "separator";
__decorateClass([
  Autowired5("menuItemMapper")
], ColumnMenuFactory.prototype, "menuItemMapper", 2);
__decorateClass([
  Autowired5("columnModel")
], ColumnMenuFactory.prototype, "columnModel", 2);
__decorateClass([
  Autowired5("rowModel")
], ColumnMenuFactory.prototype, "rowModel", 2);
__decorateClass([
  Autowired5("filterManager")
], ColumnMenuFactory.prototype, "filterManager", 2);
__decorateClass([
  Autowired5("menuService")
], ColumnMenuFactory.prototype, "menuService", 2);
ColumnMenuFactory = __decorateClass([
  Bean6("columnMenuFactory")
], ColumnMenuFactory);

// enterprise-modules/menu/src/menu/menuUtils.ts
import {
  Autowired as Autowired6,
  Bean as Bean7,
  BeanStub as BeanStub7,
  _ as _6
} from "@ag-grid-community/core";
var MenuUtils = class extends BeanStub7 {
  restoreFocusOnClose(restoreFocusParams, eComp, e, restoreIfMouseEvent) {
    const { eventSource } = restoreFocusParams;
    const isKeyboardEvent = e instanceof KeyboardEvent;
    if (!restoreIfMouseEvent && !isKeyboardEvent || !eventSource) {
      return;
    }
    const eDocument = this.gos.getDocument();
    const activeEl = this.gos.getActiveDomElement();
    if (!eComp.contains(activeEl) && activeEl !== eDocument.body) {
      return;
    }
    this.focusHeaderCell(restoreFocusParams);
  }
  closePopupAndRestoreFocusOnSelect(hidePopupFunc, restoreFocusParams, event) {
    let keyboardEvent;
    if (event && event.keyboardEvent) {
      keyboardEvent = event.keyboardEvent;
    }
    hidePopupFunc(keyboardEvent && { keyboardEvent });
    const focusedCell = this.focusService.getFocusedCell();
    const eDocument = this.gos.getDocument();
    const activeEl = this.gos.getActiveDomElement();
    if (!activeEl || activeEl === eDocument.body) {
      if (focusedCell) {
        const { rowIndex, rowPinned, column } = focusedCell;
        this.focusService.setFocusedCell({ rowIndex, column, rowPinned, forceBrowserFocus: true, preventScrollOnBrowserFocus: true });
      } else {
        this.focusHeaderCell(restoreFocusParams);
      }
    }
  }
  onContextMenu(mouseEvent, touchEvent, showMenuCallback) {
    if (!this.gos.get("allowContextMenuWithControlKey")) {
      if (mouseEvent && (mouseEvent.ctrlKey || mouseEvent.metaKey)) {
        return;
      }
    }
    if (mouseEvent) {
      this.blockMiddleClickScrollsIfNeeded(mouseEvent);
    }
    if (this.gos.get("suppressContextMenu")) {
      return;
    }
    const eventOrTouch = mouseEvent != null ? mouseEvent : touchEvent.touches[0];
    if (showMenuCallback(eventOrTouch)) {
      const event = mouseEvent != null ? mouseEvent : touchEvent;
      if (event && event.cancelable) {
        event.preventDefault();
      }
    }
  }
  focusHeaderCell(restoreFocusParams) {
    const { column, columnIndex, headerPosition, eventSource } = restoreFocusParams;
    const isColumnStillVisible = this.columnModel.getAllDisplayedColumns().some((col) => col === column);
    if (isColumnStillVisible && eventSource && _6.isVisible(eventSource)) {
      const focusableEl = this.focusService.findTabbableParent(eventSource);
      if (focusableEl) {
        if (column) {
          this.headerNavigationService.scrollToColumn(column);
        }
        focusableEl.focus();
      }
    } else if (headerPosition && columnIndex !== -1) {
      const allColumns = this.columnModel.getAllDisplayedColumns();
      const columnToFocus = allColumns[columnIndex] || _6.last(allColumns);
      if (columnToFocus) {
        this.focusService.focusHeaderPosition({
          headerPosition: {
            headerRowIndex: headerPosition.headerRowIndex,
            column: columnToFocus
          }
        });
      }
    }
  }
  blockMiddleClickScrollsIfNeeded(mouseEvent) {
    if (this.gos.get("suppressMiddleClickScrolls") && mouseEvent.which === 2) {
      mouseEvent.preventDefault();
    }
  }
};
__decorateClass([
  Autowired6("focusService")
], MenuUtils.prototype, "focusService", 2);
__decorateClass([
  Autowired6("headerNavigationService")
], MenuUtils.prototype, "headerNavigationService", 2);
__decorateClass([
  Autowired6("columnModel")
], MenuUtils.prototype, "columnModel", 2);
MenuUtils = __decorateClass([
  Bean7("menuUtils")
], MenuUtils);

// enterprise-modules/menu/src/menuModule.ts
var MenuModule = {
  version: VERSION,
  moduleName: ModuleNames5.MenuModule,
  beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper, ChartMenuItemMapper, ColumnChooserFactory, ColumnMenuFactory, MenuUtils],
  dependantModules: [
    EnterpriseCoreModule
  ]
};
export {
  MenuModule
};
