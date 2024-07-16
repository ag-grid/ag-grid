var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/side-bar/src/main.ts
var main_exports = {};
__export(main_exports, {
  SideBarModule: () => SideBarModule,
  ToolPanelColDefService: () => ToolPanelColDefService
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/side-bar/src/sideBarModule.ts
var import_core8 = require("@ag-grid-community/core");
var import_core9 = require("@ag-grid-enterprise/core");

// enterprise-modules/side-bar/src/sideBar/horizontalResizeComp.ts
var import_core = require("@ag-grid-community/core");
var HorizontalResizeComp = class extends import_core.Component {
  constructor() {
    super(
      /* html */
      `<div class="ag-tool-panel-horizontal-resize"></div>`
    );
    this.minWidth = 100;
    this.maxWidth = null;
  }
  setElementToResize(elementToResize) {
    this.elementToResize = elementToResize;
  }
  postConstruct() {
    const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
      eResizeBar: this.getGui(),
      dragStartPixels: 1,
      onResizeStart: this.onResizeStart.bind(this),
      onResizing: this.onResizing.bind(this),
      onResizeEnd: this.onResizeEnd.bind(this)
    });
    this.addDestroyFunc(finishedWithResizeFunc);
    this.setInverted(this.gos.get("enableRtl"));
  }
  dispatchResizeEvent(start, end, width) {
    const event = {
      type: import_core.Events.EVENT_TOOL_PANEL_SIZE_CHANGED,
      width,
      started: start,
      ended: end
    };
    this.eventService.dispatchEvent(event);
  }
  onResizeStart() {
    this.startingWidth = this.elementToResize.offsetWidth;
    this.dispatchResizeEvent(true, false, this.startingWidth);
  }
  onResizeEnd(delta) {
    return this.onResizing(delta, true);
  }
  onResizing(delta, isEnd = false) {
    const direction = this.inverted ? -1 : 1;
    let newWidth = Math.max(this.minWidth, Math.floor(this.startingWidth - delta * direction));
    if (this.maxWidth != null) {
      newWidth = Math.min(this.maxWidth, newWidth);
    }
    this.elementToResize.style.width = `${newWidth}px`;
    this.dispatchResizeEvent(false, isEnd, newWidth);
  }
  setInverted(inverted) {
    this.inverted = inverted;
  }
  setMaxWidth(value) {
    this.maxWidth = value;
  }
  setMinWidth(value) {
    if (value != null) {
      this.minWidth = value;
    } else {
      this.minWidth = 100;
    }
  }
};
__decorateClass([
  (0, import_core.Autowired)("horizontalResizeService")
], HorizontalResizeComp.prototype, "horizontalResizeService", 2);
__decorateClass([
  import_core.PostConstruct
], HorizontalResizeComp.prototype, "postConstruct", 1);

// enterprise-modules/side-bar/src/sideBar/sideBarComp.ts
var import_core5 = require("@ag-grid-community/core");

// enterprise-modules/side-bar/src/sideBar/sideBarButtonsComp.ts
var import_core3 = require("@ag-grid-community/core");

// enterprise-modules/side-bar/src/sideBar/sideBarButtonComp.ts
var import_core2 = require("@ag-grid-community/core");
var _SideBarButtonComp = class _SideBarButtonComp extends import_core2.Component {
  constructor(toolPanelDef) {
    super();
    this.toolPanelDef = toolPanelDef;
  }
  getToolPanelId() {
    return this.toolPanelDef.id;
  }
  postConstruct() {
    const template = this.createTemplate();
    this.setTemplate(template);
    this.setLabel();
    this.setIcon();
    this.addManagedListener(this.eToggleButton, "click", this.onButtonPressed.bind(this));
    this.eToggleButton.setAttribute("id", `ag-${this.getCompId()}-button`);
  }
  createTemplate() {
    const res = (
      /* html */
      `<div class="ag-side-button" role="presentation">
                <button type="button" ref="eToggleButton" tabindex="-1" role="tab" aria-expanded="false" class="ag-button ag-side-button-button">
                    <div ref="eIconWrapper" class="ag-side-button-icon-wrapper" aria-hidden="true"></div>
                    <span ref ="eLabel" class="ag-side-button-label"></span>
                </button>
            </div>`
    );
    return res;
  }
  setLabel() {
    const translate = this.localeService.getLocaleTextFunc();
    const def = this.toolPanelDef;
    const label = translate(def.labelKey, def.labelDefault);
    this.eLabel.innerText = label;
  }
  setIcon() {
    this.eIconWrapper.insertAdjacentElement("afterbegin", import_core2._.createIconNoSpan(this.toolPanelDef.iconKey, this.gos));
  }
  onButtonPressed() {
    this.dispatchEvent({ type: _SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED });
  }
  setSelected(selected) {
    this.addOrRemoveCssClass("ag-selected", selected);
    import_core2._.setAriaExpanded(this.eToggleButton, selected);
  }
  getButtonElement() {
    return this.eToggleButton;
  }
};
_SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED = "toggleButtonClicked";
__decorateClass([
  (0, import_core2.RefSelector)("eToggleButton")
], _SideBarButtonComp.prototype, "eToggleButton", 2);
__decorateClass([
  (0, import_core2.RefSelector)("eIconWrapper")
], _SideBarButtonComp.prototype, "eIconWrapper", 2);
__decorateClass([
  (0, import_core2.RefSelector)("eLabel")
], _SideBarButtonComp.prototype, "eLabel", 2);
__decorateClass([
  import_core2.PostConstruct
], _SideBarButtonComp.prototype, "postConstruct", 1);
var SideBarButtonComp = _SideBarButtonComp;

// enterprise-modules/side-bar/src/sideBar/sideBarButtonsComp.ts
var _SideBarButtonsComp = class _SideBarButtonsComp extends import_core3.Component {
  constructor() {
    super(_SideBarButtonsComp.TEMPLATE);
    this.buttonComps = [];
  }
  postConstruct() {
    this.addManagedListener(this.getFocusableElement(), "keydown", this.handleKeyDown.bind(this));
  }
  handleKeyDown(e) {
    if (e.key !== import_core3.KeyCode.TAB || !e.shiftKey) {
      return;
    }
    const lastColumn = import_core3._.last(this.columnModel.getAllDisplayedColumns());
    if (this.focusService.focusGridView(lastColumn, true)) {
      e.preventDefault();
    }
  }
  setActiveButton(id) {
    this.buttonComps.forEach((comp) => {
      comp.setSelected(id === comp.getToolPanelId());
    });
  }
  addButtonComp(def) {
    const buttonComp = this.createBean(new SideBarButtonComp(def));
    this.buttonComps.push(buttonComp);
    this.appendChild(buttonComp);
    buttonComp.addEventListener(SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED, () => {
      this.dispatchEvent({
        type: _SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED,
        toolPanelId: def.id
      });
    });
    return buttonComp;
  }
  clearButtons() {
    this.buttonComps = this.destroyBeans(this.buttonComps);
    import_core3._.clearElement(this.getGui());
  }
};
_SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED = "sideBarButtonClicked";
_SideBarButtonsComp.TEMPLATE = /* html */
`<div class="ag-side-buttons" role="tablist"></div>`;
__decorateClass([
  (0, import_core3.Autowired)("focusService")
], _SideBarButtonsComp.prototype, "focusService", 2);
__decorateClass([
  (0, import_core3.Autowired)("columnModel")
], _SideBarButtonsComp.prototype, "columnModel", 2);
__decorateClass([
  import_core3.PostConstruct
], _SideBarButtonsComp.prototype, "postConstruct", 1);
__decorateClass([
  import_core3.PreDestroy
], _SideBarButtonsComp.prototype, "clearButtons", 1);
var SideBarButtonsComp = _SideBarButtonsComp;

// enterprise-modules/side-bar/src/sideBar/sideBarDefParser.ts
var _SideBarDefParser = class _SideBarDefParser {
  static parse(toParse) {
    if (!toParse) {
      return void 0;
    }
    if (toParse === true) {
      return {
        toolPanels: [
          _SideBarDefParser.DEFAULT_COLUMN_COMP,
          _SideBarDefParser.DEFAULT_FILTER_COMP
        ],
        defaultToolPanel: "columns"
      };
    }
    if (typeof toParse === "string") {
      return _SideBarDefParser.parse([toParse]);
    }
    if (Array.isArray(toParse)) {
      const comps = [];
      toParse.forEach((key) => {
        const lookupResult = _SideBarDefParser.DEFAULT_BY_KEY[key];
        if (!lookupResult) {
          console.warn(`AG Grid: the key ${key} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(_SideBarDefParser.DEFAULT_BY_KEY).join(",")}`);
          return;
        }
        comps.push(lookupResult);
      });
      if (comps.length === 0) {
        return void 0;
      }
      return {
        toolPanels: comps,
        defaultToolPanel: comps[0].id
      };
    }
    const result = {
      toolPanels: _SideBarDefParser.parseComponents(toParse.toolPanels),
      defaultToolPanel: toParse.defaultToolPanel,
      hiddenByDefault: toParse.hiddenByDefault,
      position: toParse.position
    };
    return result;
  }
  static parseComponents(from) {
    const result = [];
    if (!from) {
      return result;
    }
    from.forEach((it) => {
      let toAdd = null;
      if (typeof it === "string") {
        const lookupResult = _SideBarDefParser.DEFAULT_BY_KEY[it];
        if (!lookupResult) {
          console.warn(`AG Grid: the key ${it} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(_SideBarDefParser.DEFAULT_BY_KEY).join(",")}`);
          return;
        }
        toAdd = lookupResult;
      } else {
        toAdd = it;
      }
      result.push(toAdd);
    });
    return result;
  }
};
_SideBarDefParser.DEFAULT_COLUMN_COMP = {
  id: "columns",
  labelDefault: "Columns",
  labelKey: "columns",
  iconKey: "columns",
  toolPanel: "agColumnsToolPanel"
};
_SideBarDefParser.DEFAULT_FILTER_COMP = {
  id: "filters",
  labelDefault: "Filters",
  labelKey: "filters",
  iconKey: "filter",
  toolPanel: "agFiltersToolPanel"
};
_SideBarDefParser.DEFAULT_BY_KEY = {
  columns: _SideBarDefParser.DEFAULT_COLUMN_COMP,
  filters: _SideBarDefParser.DEFAULT_FILTER_COMP
};
var SideBarDefParser = _SideBarDefParser;

// enterprise-modules/side-bar/src/sideBar/toolPanelWrapper.ts
var import_core4 = require("@ag-grid-community/core");
var _ToolPanelWrapper = class _ToolPanelWrapper extends import_core4.Component {
  constructor() {
    super(_ToolPanelWrapper.TEMPLATE);
  }
  setupResize() {
    const eGui = this.getGui();
    const resizeBar = this.resizeBar = this.createManagedBean(new HorizontalResizeComp());
    eGui.setAttribute("id", `ag-${this.getCompId()}`);
    resizeBar.setElementToResize(eGui);
    this.appendChild(resizeBar);
  }
  getToolPanelId() {
    return this.toolPanelId;
  }
  setToolPanelDef(toolPanelDef, params) {
    const { id, minWidth, maxWidth, width } = toolPanelDef;
    this.toolPanelId = id;
    this.width = width;
    const compDetails = this.userComponentFactory.getToolPanelCompDetails(toolPanelDef, params);
    const componentPromise = compDetails.newAgStackInstance();
    this.params = compDetails.params;
    if (componentPromise == null) {
      console.warn(`AG Grid: error processing tool panel component ${id}. You need to specify 'toolPanel'`);
      return;
    }
    componentPromise.then(this.setToolPanelComponent.bind(this));
    if (minWidth != null) {
      this.resizeBar.setMinWidth(minWidth);
    }
    if (maxWidth != null) {
      this.resizeBar.setMaxWidth(maxWidth);
    }
  }
  setToolPanelComponent(compInstance) {
    this.toolPanelCompInstance = compInstance;
    this.appendChild(compInstance.getGui());
    this.addDestroyFunc(() => {
      this.destroyBean(compInstance);
    });
    if (this.width) {
      this.getGui().style.width = `${this.width}px`;
    }
  }
  getToolPanelInstance() {
    return this.toolPanelCompInstance;
  }
  setResizerSizerSide(side) {
    const isRtl = this.gos.get("enableRtl");
    const isLeft = side === "left";
    const inverted = isRtl ? isLeft : !isLeft;
    this.resizeBar.setInverted(inverted);
  }
  refresh() {
    this.toolPanelCompInstance.refresh(this.params);
  }
};
_ToolPanelWrapper.TEMPLATE = /* html */
`<div class="ag-tool-panel-wrapper" role="tabpanel"/>`;
__decorateClass([
  (0, import_core4.Autowired)("userComponentFactory")
], _ToolPanelWrapper.prototype, "userComponentFactory", 2);
__decorateClass([
  import_core4.PostConstruct
], _ToolPanelWrapper.prototype, "setupResize", 1);
var ToolPanelWrapper = _ToolPanelWrapper;

// enterprise-modules/side-bar/src/sideBar/sideBarComp.ts
var _SideBarComp = class _SideBarComp extends import_core5.Component {
  constructor() {
    super(_SideBarComp.TEMPLATE);
    this.toolPanelWrappers = [];
  }
  postConstruct() {
    var _a;
    this.sideBarButtonsComp.addEventListener(SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED, this.onToolPanelButtonClicked.bind(this));
    const { sideBar: sideBarState } = (_a = this.gos.get("initialState")) != null ? _a : {};
    this.setSideBarDef({
      sideBarDef: SideBarDefParser.parse(this.gos.get("sideBar")),
      sideBarState
    });
    this.addManagedPropertyListener("sideBar", this.onSideBarUpdated.bind(this));
    this.sideBarService.registerSideBarComp(this);
    this.createManagedBean(new import_core5.ManagedFocusFeature(
      this.getFocusableElement(),
      {
        onTabKeyDown: this.onTabKeyDown.bind(this),
        handleKeyDown: this.handleKeyDown.bind(this)
      }
    ));
  }
  onTabKeyDown(e) {
    if (e.defaultPrevented) {
      return;
    }
    const { focusService, sideBarButtonsComp } = this;
    const eGui = this.getGui();
    const sideBarGui = sideBarButtonsComp.getGui();
    const activeElement = this.gos.getActiveDomElement();
    const openPanel = eGui.querySelector(".ag-tool-panel-wrapper:not(.ag-hidden)");
    const target = e.target;
    if (!openPanel) {
      return;
    }
    if (sideBarGui.contains(activeElement)) {
      if (focusService.focusInto(openPanel, e.shiftKey)) {
        e.preventDefault();
      }
      return;
    }
    if (!e.shiftKey) {
      return;
    }
    let nextEl = null;
    if (openPanel.contains(activeElement)) {
      nextEl = this.focusService.findNextFocusableElement(openPanel, void 0, true);
    } else if (focusService.isTargetUnderManagedComponent(openPanel, target) && e.shiftKey) {
      nextEl = this.focusService.findFocusableElementBeforeTabGuard(openPanel, target);
    }
    if (!nextEl) {
      nextEl = sideBarGui.querySelector(".ag-selected button");
    }
    if (nextEl && nextEl !== e.target) {
      e.preventDefault();
      nextEl.focus();
    }
  }
  handleKeyDown(e) {
    const currentButton = this.gos.getActiveDomElement();
    if (!this.sideBarButtonsComp.getGui().contains(currentButton)) {
      return;
    }
    const sideBarGui = this.sideBarButtonsComp.getGui();
    const buttons = Array.prototype.slice.call(sideBarGui.querySelectorAll(".ag-side-button"));
    const currentPos = buttons.findIndex((button) => button.contains(currentButton));
    let nextPos = null;
    switch (e.key) {
      case import_core5.KeyCode.LEFT:
      case import_core5.KeyCode.UP:
        nextPos = Math.max(0, currentPos - 1);
        break;
      case import_core5.KeyCode.RIGHT:
      case import_core5.KeyCode.DOWN:
        nextPos = Math.min(currentPos + 1, buttons.length - 1);
        break;
    }
    if (nextPos === null) {
      return;
    }
    const innerButton = buttons[nextPos].querySelector("button");
    if (innerButton) {
      innerButton.focus();
      e.preventDefault();
    }
  }
  onToolPanelButtonClicked(event) {
    const id = event.toolPanelId;
    const openedItem = this.openedItem();
    if (openedItem === id) {
      this.openToolPanel(void 0, "sideBarButtonClicked");
    } else {
      this.openToolPanel(id, "sideBarButtonClicked");
    }
  }
  clearDownUi() {
    this.sideBarButtonsComp.clearButtons();
    this.destroyToolPanelWrappers();
  }
  setSideBarDef({
    sideBarDef,
    sideBarState,
    existingToolPanelWrappers
  }) {
    this.setDisplayed(false);
    this.sideBar = sideBarDef;
    if (!!this.sideBar && !!this.sideBar.toolPanels) {
      const toolPanelDefs = this.sideBar.toolPanels;
      this.createToolPanelsAndSideButtons(toolPanelDefs, sideBarState, existingToolPanelWrappers);
      if (!this.toolPanelWrappers.length) {
        return;
      }
      const shouldDisplaySideBar = sideBarState ? sideBarState.visible : !this.sideBar.hiddenByDefault;
      this.setDisplayed(shouldDisplaySideBar);
      this.setSideBarPosition(sideBarState ? sideBarState.position : this.sideBar.position);
      if (shouldDisplaySideBar) {
        if (sideBarState) {
          const { openToolPanel } = sideBarState;
          if (openToolPanel) {
            this.openToolPanel(openToolPanel, "sideBarInitializing");
          }
        } else {
          this.openToolPanel(this.sideBar.defaultToolPanel, "sideBarInitializing");
        }
      }
    }
  }
  getDef() {
    return this.sideBar;
  }
  setSideBarPosition(position) {
    if (!position) {
      position = "right";
    }
    this.position = position;
    const isLeft = position === "left";
    const resizerSide = isLeft ? "right" : "left";
    this.addOrRemoveCssClass("ag-side-bar-left", isLeft);
    this.addOrRemoveCssClass("ag-side-bar-right", !isLeft);
    this.toolPanelWrappers.forEach((wrapper) => {
      wrapper.setResizerSizerSide(resizerSide);
    });
    this.eventService.dispatchEvent({ type: import_core5.Events.EVENT_SIDE_BAR_UPDATED });
    return this;
  }
  setDisplayed(displayed, options) {
    super.setDisplayed(displayed, options);
    this.eventService.dispatchEvent({ type: import_core5.Events.EVENT_SIDE_BAR_UPDATED });
  }
  getState() {
    const toolPanels = {};
    this.toolPanelWrappers.forEach((wrapper) => {
      var _a, _b;
      toolPanels[wrapper.getToolPanelId()] = (_b = (_a = wrapper.getToolPanelInstance()) == null ? void 0 : _a.getState) == null ? void 0 : _b.call(_a);
    });
    return {
      visible: this.isDisplayed(),
      position: this.position,
      openToolPanel: this.openedItem(),
      toolPanels
    };
  }
  createToolPanelsAndSideButtons(defs, sideBarState, existingToolPanelWrappers) {
    var _a;
    for (const def of defs) {
      this.createToolPanelAndSideButton(def, (_a = sideBarState == null ? void 0 : sideBarState.toolPanels) == null ? void 0 : _a[def.id], existingToolPanelWrappers == null ? void 0 : existingToolPanelWrappers[def.id]);
    }
  }
  validateDef(def) {
    if (def.id == null) {
      console.warn(`AG Grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id`);
      return false;
    }
    if (def.toolPanel === "agColumnsToolPanel") {
      const moduleMissing = !import_core5.ModuleRegistry.__assertRegistered(import_core5.ModuleNames.ColumnsToolPanelModule, "Column Tool Panel", this.context.getGridId());
      if (moduleMissing) {
        return false;
      }
    }
    if (def.toolPanel === "agFiltersToolPanel") {
      const moduleMissing = !import_core5.ModuleRegistry.__assertRegistered(import_core5.ModuleNames.FiltersToolPanelModule, "Filters Tool Panel", this.context.getGridId());
      if (moduleMissing) {
        return false;
      }
      if (this.filterManager.isAdvancedFilterEnabled()) {
        import_core5._.warnOnce("Advanced Filter does not work with Filters Tool Panel. Filters Tool Panel has been disabled.");
        return false;
      }
    }
    return true;
  }
  createToolPanelAndSideButton(def, initialState, existingToolPanelWrapper) {
    if (!this.validateDef(def)) {
      return;
    }
    const button = this.sideBarButtonsComp.addButtonComp(def);
    let wrapper;
    if (existingToolPanelWrapper) {
      wrapper = existingToolPanelWrapper;
    } else {
      wrapper = this.getContext().createBean(new ToolPanelWrapper());
      wrapper.setToolPanelDef(def, {
        initialState,
        onStateUpdated: () => this.eventService.dispatchEvent({ type: import_core5.Events.EVENT_SIDE_BAR_UPDATED })
      });
    }
    wrapper.setDisplayed(false);
    const wrapperGui = wrapper.getGui();
    this.appendChild(wrapperGui);
    this.toolPanelWrappers.push(wrapper);
    import_core5._.setAriaControls(button.getButtonElement(), wrapperGui);
  }
  refresh() {
    this.toolPanelWrappers.forEach((wrapper) => wrapper.refresh());
  }
  openToolPanel(key, source = "api") {
    const currentlyOpenedKey = this.openedItem();
    if (currentlyOpenedKey === key) {
      return;
    }
    this.toolPanelWrappers.forEach((wrapper) => {
      const show = key === wrapper.getToolPanelId();
      wrapper.setDisplayed(show);
    });
    const newlyOpenedKey = this.openedItem();
    const openToolPanelChanged = currentlyOpenedKey !== newlyOpenedKey;
    if (openToolPanelChanged) {
      this.sideBarButtonsComp.setActiveButton(key);
      this.raiseToolPanelVisibleEvent(key, currentlyOpenedKey != null ? currentlyOpenedKey : void 0, source);
    }
  }
  getToolPanelInstance(key) {
    const toolPanelWrapper = this.toolPanelWrappers.filter((toolPanel) => toolPanel.getToolPanelId() === key)[0];
    if (!toolPanelWrapper) {
      console.warn(`AG Grid: unable to lookup Tool Panel as invalid key supplied: ${key}`);
      return;
    }
    return toolPanelWrapper.getToolPanelInstance();
  }
  raiseToolPanelVisibleEvent(key, previousKey, source) {
    const switchingToolPanel = !!key && !!previousKey;
    if (previousKey) {
      const event = {
        type: import_core5.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
        source,
        key: previousKey,
        visible: false,
        switchingToolPanel
      };
      this.eventService.dispatchEvent(event);
    }
    if (key) {
      const event = {
        type: import_core5.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
        source,
        key,
        visible: true,
        switchingToolPanel
      };
      this.eventService.dispatchEvent(event);
    }
  }
  close(source = "api") {
    this.openToolPanel(void 0, source);
  }
  isToolPanelShowing() {
    return !!this.openedItem();
  }
  openedItem() {
    let activeToolPanel = null;
    this.toolPanelWrappers.forEach((wrapper) => {
      if (wrapper.isDisplayed()) {
        activeToolPanel = wrapper.getToolPanelId();
      }
    });
    return activeToolPanel;
  }
  onSideBarUpdated() {
    var _a;
    const sideBarDef = SideBarDefParser.parse(this.gos.get("sideBar"));
    let existingToolPanelWrappers = {};
    if (sideBarDef && this.sideBar) {
      (_a = sideBarDef.toolPanels) == null ? void 0 : _a.forEach((toolPanelDef) => {
        var _a2, _b;
        const { id } = toolPanelDef;
        if (!id) {
          return;
        }
        const existingToolPanelDef = (_a2 = this.sideBar.toolPanels) == null ? void 0 : _a2.find(
          (toolPanelDefToCheck) => toolPanelDefToCheck.id === id
        );
        if (!existingToolPanelDef || toolPanelDef.toolPanel !== existingToolPanelDef.toolPanel) {
          return;
        }
        const toolPanelWrapper = this.toolPanelWrappers.find((toolPanel) => toolPanel.getToolPanelId() === id);
        if (!toolPanelWrapper) {
          return;
        }
        const params = this.gos.addGridCommonParams(__spreadProps(__spreadValues({}, (_b = toolPanelDef.toolPanelParams) != null ? _b : {}), {
          onStateUpdated: () => this.eventService.dispatchEvent({ type: import_core5.Events.EVENT_SIDE_BAR_UPDATED })
        }));
        const hasRefreshed = toolPanelWrapper.getToolPanelInstance().refresh(params);
        if (hasRefreshed !== true) {
          return;
        }
        this.toolPanelWrappers = this.toolPanelWrappers.filter((toolPanel) => toolPanel !== toolPanelWrapper);
        import_core5._.removeFromParent(toolPanelWrapper.getGui());
        existingToolPanelWrappers[id] = toolPanelWrapper;
      });
    }
    this.clearDownUi();
    this.setSideBarDef({ sideBarDef, existingToolPanelWrappers });
  }
  destroyToolPanelWrappers() {
    this.toolPanelWrappers.forEach((wrapper) => {
      import_core5._.removeFromParent(wrapper.getGui());
      this.destroyBean(wrapper);
    });
    this.toolPanelWrappers.length = 0;
  }
  destroy() {
    this.destroyToolPanelWrappers();
    super.destroy();
  }
};
_SideBarComp.TEMPLATE = /* html */
`<div class="ag-side-bar ag-unselectable">
            <ag-side-bar-buttons ref="sideBarButtons"></ag-side-bar-buttons>
        </div>`;
__decorateClass([
  (0, import_core5.Autowired)("focusService")
], _SideBarComp.prototype, "focusService", 2);
__decorateClass([
  (0, import_core5.Autowired)("filterManager")
], _SideBarComp.prototype, "filterManager", 2);
__decorateClass([
  (0, import_core5.Autowired)("sideBarService")
], _SideBarComp.prototype, "sideBarService", 2);
__decorateClass([
  (0, import_core5.RefSelector)("sideBarButtons")
], _SideBarComp.prototype, "sideBarButtonsComp", 2);
__decorateClass([
  import_core5.PostConstruct
], _SideBarComp.prototype, "postConstruct", 1);
var SideBarComp = _SideBarComp;

// enterprise-modules/side-bar/src/sideBar/common/toolPanelColDefService.ts
var import_core6 = require("@ag-grid-community/core");
var ToolPanelColDefService = class extends import_core6.BeanStub {
  constructor() {
    super(...arguments);
    this.isColGroupDef = (colDef) => colDef && typeof colDef.children !== "undefined";
    this.getId = (colDef) => {
      return this.isColGroupDef(colDef) ? colDef.groupId : colDef.colId;
    };
  }
  createColumnTree(colDefs) {
    const invalidColIds = [];
    const createDummyColGroup = (abstractColDef, depth) => {
      if (this.isColGroupDef(abstractColDef)) {
        const groupDef = abstractColDef;
        const groupId = typeof groupDef.groupId !== "undefined" ? groupDef.groupId : groupDef.headerName;
        const group = new import_core6.ProvidedColumnGroup(groupDef, groupId, false, depth);
        const children = [];
        groupDef.children.forEach((def) => {
          const child = createDummyColGroup(def, depth + 1);
          if (child) {
            children.push(child);
          }
        });
        group.setChildren(children);
        return group;
      } else {
        const colDef = abstractColDef;
        const key = colDef.colId ? colDef.colId : colDef.field;
        const column = this.columnModel.getPrimaryColumn(key);
        if (!column) {
          invalidColIds.push(colDef);
        }
        return column;
      }
    };
    const mappedResults = [];
    colDefs.forEach((colDef) => {
      const result = createDummyColGroup(colDef, 0);
      if (result) {
        mappedResults.push(result);
      }
    });
    if (invalidColIds.length > 0) {
      console.warn("AG Grid: unable to find grid columns for the supplied colDef(s):", invalidColIds);
    }
    return mappedResults;
  }
  syncLayoutWithGrid(syncLayoutCallback) {
    const leafPathTrees = this.getLeafPathTrees();
    const mergedColumnTrees = this.mergeLeafPathTrees(leafPathTrees);
    syncLayoutCallback(mergedColumnTrees);
  }
  getLeafPathTrees() {
    const getLeafPathTree = (node, childDef) => {
      let leafPathTree;
      if (node instanceof import_core6.ProvidedColumnGroup) {
        if (node.isPadding()) {
          leafPathTree = childDef;
        } else {
          const groupDef = Object.assign({}, node.getColGroupDef());
          groupDef.groupId = node.getGroupId();
          groupDef.children = [childDef];
          leafPathTree = groupDef;
        }
      } else {
        const colDef = Object.assign({}, node.getColDef());
        colDef.colId = node.getColId();
        leafPathTree = colDef;
      }
      const parent = node.getOriginalParent();
      if (parent) {
        return getLeafPathTree(parent, leafPathTree);
      } else {
        return leafPathTree;
      }
    };
    const allGridColumns = this.columnModel.getAllGridColumns();
    const allPrimaryGridColumns = allGridColumns.filter((column) => {
      const colDef = column.getColDef();
      return column.isPrimary() && !colDef.showRowGroup;
    });
    return allPrimaryGridColumns.map((col) => getLeafPathTree(col, col.getColDef()));
  }
  mergeLeafPathTrees(leafPathTrees) {
    const matchingRootGroupIds = (pathA, pathB) => {
      const bothPathsAreGroups = this.isColGroupDef(pathA) && this.isColGroupDef(pathB);
      return bothPathsAreGroups && this.getId(pathA) === this.getId(pathB);
    };
    const mergeTrees = (treeA, treeB) => {
      if (!this.isColGroupDef(treeB)) {
        return treeA;
      }
      const mergeResult = treeA;
      const groupToMerge = treeB;
      if (groupToMerge.children && groupToMerge.groupId) {
        const added = this.addChildrenToGroup(mergeResult, groupToMerge.groupId, groupToMerge.children[0]);
        if (added) {
          return mergeResult;
        }
      }
      groupToMerge.children.forEach((child) => mergeTrees(mergeResult, child));
      return mergeResult;
    };
    const mergeColDefs = [];
    for (let i = 1; i <= leafPathTrees.length; i++) {
      const first = leafPathTrees[i - 1];
      const second = leafPathTrees[i];
      if (matchingRootGroupIds(first, second)) {
        leafPathTrees[i] = mergeTrees(first, second);
      } else {
        mergeColDefs.push(first);
      }
    }
    return mergeColDefs;
  }
  addChildrenToGroup(tree, groupId, colDef) {
    const subGroupIsSplit = (currentSubGroup, currentSubGroupToAdd) => {
      const existingChildIds = currentSubGroup.children.map(this.getId);
      const childGroupAlreadyExists = import_core6._.includes(existingChildIds, this.getId(currentSubGroupToAdd));
      const lastChild = import_core6._.last(currentSubGroup.children);
      const lastChildIsDifferent = lastChild && this.getId(lastChild) !== this.getId(currentSubGroupToAdd);
      return childGroupAlreadyExists && lastChildIsDifferent;
    };
    if (!this.isColGroupDef(tree)) {
      return true;
    }
    const currentGroup = tree;
    const groupToAdd = colDef;
    if (subGroupIsSplit(currentGroup, groupToAdd)) {
      currentGroup.children.push(groupToAdd);
      return true;
    }
    if (currentGroup.groupId === groupId) {
      const existingChildIds = currentGroup.children.map(this.getId);
      const colDefAlreadyPresent = import_core6._.includes(existingChildIds, this.getId(groupToAdd));
      if (!colDefAlreadyPresent) {
        currentGroup.children.push(groupToAdd);
        return true;
      }
    }
    currentGroup.children.forEach((subGroup) => this.addChildrenToGroup(subGroup, groupId, colDef));
    return false;
  }
};
__decorateClass([
  (0, import_core6.Autowired)("columnModel")
], ToolPanelColDefService.prototype, "columnModel", 2);
ToolPanelColDefService = __decorateClass([
  (0, import_core6.Bean)("toolPanelColDefService")
], ToolPanelColDefService);

// enterprise-modules/side-bar/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/side-bar/src/sideBar/sideBarService.ts
var import_core7 = require("@ag-grid-community/core");
var SideBarService = class extends import_core7.BeanStub {
  registerSideBarComp(sideBarComp) {
    this.sideBarComp = sideBarComp;
  }
  getSideBarComp() {
    return this.sideBarComp;
  }
};
SideBarService = __decorateClass([
  (0, import_core7.Bean)("sideBarService")
], SideBarService);

// enterprise-modules/side-bar/src/sideBarModule.ts
var SideBarModule = {
  version: VERSION,
  moduleName: import_core8.ModuleNames.SideBarModule,
  beans: [ToolPanelColDefService, SideBarService],
  agStackComponents: [
    { componentName: "AgHorizontalResize", componentClass: HorizontalResizeComp },
    { componentName: "AgSideBar", componentClass: SideBarComp },
    { componentName: "AgSideBarButtons", componentClass: SideBarButtonsComp }
  ],
  dependantModules: [
    import_core9.EnterpriseCoreModule
  ]
};
