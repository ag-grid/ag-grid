var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// enterprise-modules/side-bar/src/main.ts
var main_exports = {};
__export(main_exports, {
  SideBarModule: () => SideBarModule,
  ToolPanelColDefService: () => ToolPanelColDefService
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/side-bar/src/sideBarModule.ts
var import_core10 = require("@ag-grid-community/core");
var import_core11 = require("@ag-grid-enterprise/core");

// enterprise-modules/side-bar/src/sideBar/common/toolPanelColDefService.ts
var import_core = require("@ag-grid-community/core");
var ToolPanelColDefService = class extends import_core.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "toolPanelColDefService";
    this.isColGroupDef = (colDef) => colDef && typeof colDef.children !== "undefined";
    this.getId = (colDef) => {
      return this.isColGroupDef(colDef) ? colDef.groupId : colDef.colId;
    };
  }
  wireBeans(beans) {
    this.columnModel = beans.columnModel;
  }
  createColumnTree(colDefs) {
    const invalidColIds = [];
    const createDummyColGroup = (abstractColDef, depth) => {
      if (this.isColGroupDef(abstractColDef)) {
        const groupDef = abstractColDef;
        const groupId = typeof groupDef.groupId !== "undefined" ? groupDef.groupId : groupDef.headerName;
        const group = new import_core.AgProvidedColumnGroup(groupDef, groupId, false, depth);
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
        const column = this.columnModel.getColDefCol(key);
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
      (0, import_core._warnOnce)("unable to find grid columns for the supplied colDef(s):", invalidColIds);
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
      if ((0, import_core.isProvidedColumnGroup)(node)) {
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
    const allGridColumns = this.columnModel.getCols();
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
      const childGroupAlreadyExists = (0, import_core._includes)(existingChildIds, this.getId(currentSubGroupToAdd));
      const lastChild = (0, import_core._last)(currentSubGroup.children);
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
      const colDefAlreadyPresent = (0, import_core._includes)(existingChildIds, this.getId(groupToAdd));
      if (!colDefAlreadyPresent) {
        currentGroup.children.push(groupToAdd);
        return true;
      }
    }
    currentGroup.children.forEach((subGroup) => this.addChildrenToGroup(subGroup, groupId, colDef));
    return false;
  }
};

// enterprise-modules/side-bar/src/sideBar/sideBarApi.ts
var import_core2 = require("@ag-grid-community/core");
function isSideBarVisible(beans) {
  return beans.sideBarService?.getSideBarComp().isDisplayed() ?? false;
}
function setSideBarVisible(beans, show) {
  beans.sideBarService?.getSideBarComp().setDisplayed(show);
}
function setSideBarPosition(beans, position) {
  beans.sideBarService?.getSideBarComp().setSideBarPosition(position);
}
function openToolPanel(beans, key) {
  beans.sideBarService?.getSideBarComp().openToolPanel(key, "api");
}
function closeToolPanel(beans) {
  beans.sideBarService?.getSideBarComp().close("api");
}
function getOpenedToolPanel(beans) {
  return beans.sideBarService?.getSideBarComp().openedItem() ?? null;
}
function refreshToolPanel(beans) {
  beans.sideBarService?.getSideBarComp().refresh();
}
function isToolPanelShowing(beans) {
  return beans.sideBarService?.getSideBarComp().isToolPanelShowing() ?? false;
}
function getToolPanelInstance(beans, id) {
  const comp = beans.sideBarService?.getSideBarComp().getToolPanelInstance(id);
  return (0, import_core2._unwrapUserComp)(comp);
}
function getSideBar(beans) {
  return beans.sideBarService?.getSideBarComp().getDef();
}

// enterprise-modules/side-bar/src/sideBar/sideBarService.ts
var import_core9 = require("@ag-grid-community/core");

// enterprise-modules/side-bar/src/sideBar/agSideBar.ts
var import_core8 = require("@ag-grid-community/core");

// enterprise-modules/side-bar/src/sideBar/agSideBarButtons.ts
var import_core4 = require("@ag-grid-community/core");

// enterprise-modules/side-bar/src/sideBar/sideBarButtonComp.ts
var import_core3 = require("@ag-grid-community/core");
var SideBarButtonComp = class extends import_core3.Component {
  constructor(toolPanelDef) {
    super();
    this.eToggleButton = import_core3.RefPlaceholder;
    this.eIconWrapper = import_core3.RefPlaceholder;
    this.eLabel = import_core3.RefPlaceholder;
    this.toolPanelDef = toolPanelDef;
  }
  getToolPanelId() {
    return this.toolPanelDef.id;
  }
  postConstruct() {
    const template = this.createTemplate();
    this.setTemplate(template, []);
    this.setLabel();
    this.setIcon();
    this.addManagedElementListeners(this.eToggleButton, { click: this.onButtonPressed.bind(this) });
    this.eToggleButton.setAttribute("id", `ag-${this.getCompId()}-button`);
  }
  createTemplate() {
    const res = (
      /* html */
      `<div class="ag-side-button" role="presentation">
                <button type="button" data-ref="eToggleButton" tabindex="-1" role="tab" aria-expanded="false" class="ag-button ag-side-button-button">
                    <div data-ref="eIconWrapper" class="ag-side-button-icon-wrapper" aria-hidden="true"></div>
                    <span data-ref="eLabel" class="ag-side-button-label"></span>
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
    this.eIconWrapper.insertAdjacentElement("afterbegin", (0, import_core3._createIconNoSpan)(this.toolPanelDef.iconKey, this.gos));
  }
  onButtonPressed() {
    this.dispatchLocalEvent({ type: "toggleButtonClicked" });
  }
  setSelected(selected) {
    this.addOrRemoveCssClass("ag-selected", selected);
    (0, import_core3._setAriaExpanded)(this.eToggleButton, selected);
  }
  getButtonElement() {
    return this.eToggleButton;
  }
};

// enterprise-modules/side-bar/src/sideBar/agSideBarButtons.ts
var AgSideBarButtons = class extends import_core4.Component {
  constructor() {
    super(
      /* html */
      `<div class="ag-side-buttons" role="tablist"></div>`
    );
    this.buttonComps = [];
  }
  wireBeans(beans) {
    this.focusService = beans.focusService;
    this.visibleColsService = beans.visibleColsService;
  }
  postConstruct() {
    this.addManagedElementListeners(this.getFocusableElement(), { keydown: this.handleKeyDown.bind(this) });
  }
  handleKeyDown(e) {
    if (e.key !== import_core4.KeyCode.TAB || !e.shiftKey) {
      return;
    }
    const lastColumn = (0, import_core4._last)(this.visibleColsService.getAllCols());
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
    buttonComp.addEventListener("toggleButtonClicked", () => {
      this.dispatchLocalEvent({
        type: "sideBarButtonClicked",
        toolPanelId: def.id
      });
    });
    return buttonComp;
  }
  clearButtons() {
    this.buttonComps = this.destroyBeans(this.buttonComps);
    (0, import_core4._clearElement)(this.getGui());
    super.destroy();
  }
  destroy() {
    this.clearButtons();
    super.destroy();
  }
};
var AgSideBarButtonsSelector = {
  selector: "AG-SIDE-BAR-BUTTONS",
  component: AgSideBarButtons
};

// enterprise-modules/side-bar/src/sideBar/sideBarDefParser.ts
var import_core5 = require("@ag-grid-community/core");
var DEFAULT_COLUMN_COMP = {
  id: "columns",
  labelDefault: "Columns",
  labelKey: "columns",
  iconKey: "columns",
  toolPanel: "agColumnsToolPanel"
};
var DEFAULT_FILTER_COMP = {
  id: "filters",
  labelDefault: "Filters",
  labelKey: "filters",
  iconKey: "filter",
  toolPanel: "agFiltersToolPanel"
};
var DEFAULT_BY_KEY = {
  columns: DEFAULT_COLUMN_COMP,
  filters: DEFAULT_FILTER_COMP
};
function parseSideBarDef(toParse) {
  if (!toParse) {
    return void 0;
  }
  if (toParse === true) {
    return {
      toolPanels: [DEFAULT_COLUMN_COMP, DEFAULT_FILTER_COMP],
      defaultToolPanel: "columns"
    };
  }
  if (typeof toParse === "string") {
    return parseSideBarDef([toParse]);
  }
  if (Array.isArray(toParse)) {
    const comps = [];
    toParse.forEach((key) => {
      const lookupResult = DEFAULT_BY_KEY[key];
      if (!lookupResult) {
        logMissingKey(key);
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
    toolPanels: parseComponents(toParse.toolPanels),
    defaultToolPanel: toParse.defaultToolPanel,
    hiddenByDefault: toParse.hiddenByDefault,
    position: toParse.position
  };
  return result;
}
function logMissingKey(key) {
  (0, import_core5._warnOnce)(
    `the key ${key} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(DEFAULT_BY_KEY).join(",")}`
  );
}
function parseComponents(from) {
  const result = [];
  if (!from) {
    return result;
  }
  from.forEach((it) => {
    let toAdd = null;
    if (typeof it === "string") {
      const lookupResult = DEFAULT_BY_KEY[it];
      if (!lookupResult) {
        logMissingKey(it);
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

// enterprise-modules/side-bar/src/sideBar/toolPanelWrapper.ts
var import_core7 = require("@ag-grid-community/core");

// enterprise-modules/side-bar/src/sideBar/agHorizontalResize.ts
var import_core6 = require("@ag-grid-community/core");
var AgHorizontalResize = class extends import_core6.Component {
  constructor() {
    super(
      /* html */
      `<div class="ag-tool-panel-horizontal-resize"></div>`
    );
    this.minWidth = 100;
    this.maxWidth = null;
  }
  wireBeans(beans) {
    this.horizontalResizeService = beans.horizontalResizeService;
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
      type: "toolPanelSizeChanged",
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

// enterprise-modules/side-bar/src/sideBar/toolPanelWrapper.ts
var ToolPanelWrapper = class extends import_core7.Component {
  wireBeans(beans) {
    this.userComponentFactory = beans.userComponentFactory;
  }
  constructor() {
    super(
      /* html */
      `<div class="ag-tool-panel-wrapper" role="tabpanel"/>`
    );
  }
  postConstruct() {
    const eGui = this.getGui();
    const resizeBar = this.resizeBar = this.createManagedBean(new AgHorizontalResize());
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
      (0, import_core7._warnOnce)(`error processing tool panel component ${id}. You need to specify 'toolPanel'`);
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
    this.toolPanelCompInstance?.refresh(this.params);
  }
};

// enterprise-modules/side-bar/src/sideBar/agSideBar.ts
var AgSideBar = class extends import_core8.Component {
  constructor() {
    super(
      /* html */
      `<div class="ag-side-bar ag-unselectable">
            <ag-side-bar-buttons data-ref="sideBarButtons"></ag-side-bar-buttons>
        </div>`,
      [AgSideBarButtonsSelector]
    );
    this.sideBarButtons = import_core8.RefPlaceholder;
    this.toolPanelWrappers = [];
  }
  wireBeans(beans) {
    this.focusService = beans.focusService;
    this.filterManager = beans.filterManager;
    this.sideBarService = beans.sideBarService;
  }
  postConstruct() {
    this.sideBarButtons.addEventListener("sideBarButtonClicked", this.onToolPanelButtonClicked.bind(this));
    const { sideBar: sideBarState } = this.gos.get("initialState") ?? {};
    this.setSideBarDef({
      sideBarDef: parseSideBarDef(this.gos.get("sideBar")),
      sideBarState
    });
    this.addManagedPropertyListener("sideBar", this.onSideBarUpdated.bind(this));
    this.sideBarService.registerSideBarComp(this);
    const eGui = this.getFocusableElement();
    this.createManagedBean(
      new import_core8.ManagedFocusFeature(eGui, {
        onTabKeyDown: this.onTabKeyDown.bind(this),
        handleKeyDown: this.handleKeyDown.bind(this)
      })
    );
    (0, import_core8._addFocusableContainerListener)(this, eGui, this.focusService);
  }
  onTabKeyDown(e) {
    if (e.defaultPrevented) {
      return;
    }
    const { focusService, sideBarButtons } = this;
    const eGui = this.getGui();
    const sideBarGui = sideBarButtons.getGui();
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
    if (!this.sideBarButtons.getGui().contains(currentButton)) {
      return;
    }
    const sideBarGui = this.sideBarButtons.getGui();
    const buttons = Array.prototype.slice.call(sideBarGui.querySelectorAll(".ag-side-button"));
    const currentPos = buttons.findIndex((button) => button.contains(currentButton));
    let nextPos = null;
    switch (e.key) {
      case import_core8.KeyCode.LEFT:
      case import_core8.KeyCode.UP:
        nextPos = Math.max(0, currentPos - 1);
        break;
      case import_core8.KeyCode.RIGHT:
      case import_core8.KeyCode.DOWN:
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
    this.sideBarButtons.clearButtons();
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
          const { openToolPanel: openToolPanel2 } = sideBarState;
          if (openToolPanel2) {
            this.openToolPanel(openToolPanel2, "sideBarInitializing");
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
    this.eventService.dispatchEvent({ type: "sideBarUpdated" });
    return this;
  }
  setDisplayed(displayed, options) {
    super.setDisplayed(displayed, options);
    this.eventService.dispatchEvent({ type: "sideBarUpdated" });
  }
  getState() {
    const toolPanels = {};
    this.toolPanelWrappers.forEach((wrapper) => {
      toolPanels[wrapper.getToolPanelId()] = wrapper.getToolPanelInstance()?.getState?.();
    });
    return {
      visible: this.isDisplayed(),
      position: this.position,
      openToolPanel: this.openedItem(),
      toolPanels
    };
  }
  createToolPanelsAndSideButtons(defs, sideBarState, existingToolPanelWrappers) {
    for (const def of defs) {
      this.createToolPanelAndSideButton(
        def,
        sideBarState?.toolPanels?.[def.id],
        existingToolPanelWrappers?.[def.id]
      );
    }
  }
  validateDef(def) {
    if (def.id == null) {
      (0, import_core8._warnOnce)(
        `please review all your toolPanel components, it seems like at least one of them doesn't have an id`
      );
      return false;
    }
    if (def.toolPanel === "agColumnsToolPanel") {
      const moduleMissing = !import_core8.ModuleRegistry.__assertRegistered(
        import_core8.ModuleNames.ColumnsToolPanelModule,
        "Column Tool Panel",
        this.gridId
      );
      if (moduleMissing) {
        return false;
      }
    }
    if (def.toolPanel === "agFiltersToolPanel") {
      const moduleMissing = !import_core8.ModuleRegistry.__assertRegistered(
        import_core8.ModuleNames.FiltersToolPanelModule,
        "Filters Tool Panel",
        this.gridId
      );
      if (moduleMissing) {
        return false;
      }
      if (this.filterManager?.isAdvancedFilterEnabled()) {
        (0, import_core8._warnOnce)(
          "Advanced Filter does not work with Filters Tool Panel. Filters Tool Panel has been disabled."
        );
        return false;
      }
    }
    return true;
  }
  createToolPanelAndSideButton(def, initialState, existingToolPanelWrapper) {
    if (!this.validateDef(def)) {
      return;
    }
    const button = this.sideBarButtons.addButtonComp(def);
    let wrapper;
    if (existingToolPanelWrapper) {
      wrapper = existingToolPanelWrapper;
    } else {
      wrapper = this.createBean(new ToolPanelWrapper());
      wrapper.setToolPanelDef(def, {
        initialState,
        onStateUpdated: () => this.eventService.dispatchEvent({ type: "sideBarUpdated" })
      });
    }
    wrapper.setDisplayed(false);
    const wrapperGui = wrapper.getGui();
    this.appendChild(wrapperGui);
    this.toolPanelWrappers.push(wrapper);
    (0, import_core8._setAriaControls)(button.getButtonElement(), wrapperGui);
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
      this.sideBarButtons.setActiveButton(key);
      this.raiseToolPanelVisibleEvent(key, currentlyOpenedKey ?? void 0, source);
    }
  }
  getToolPanelInstance(key) {
    const toolPanelWrapper = this.toolPanelWrappers.filter((toolPanel) => toolPanel.getToolPanelId() === key)[0];
    if (!toolPanelWrapper) {
      (0, import_core8._warnOnce)(`unable to lookup Tool Panel as invalid key supplied: ${key}`);
      return;
    }
    return toolPanelWrapper.getToolPanelInstance();
  }
  raiseToolPanelVisibleEvent(key, previousKey, source) {
    const switchingToolPanel = !!key && !!previousKey;
    if (previousKey) {
      const event = {
        type: "toolPanelVisibleChanged",
        source,
        key: previousKey,
        visible: false,
        switchingToolPanel
      };
      this.eventService.dispatchEvent(event);
    }
    if (key) {
      const event = {
        type: "toolPanelVisibleChanged",
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
    const sideBarDef = parseSideBarDef(this.gos.get("sideBar"));
    const existingToolPanelWrappers = {};
    if (sideBarDef && this.sideBar) {
      sideBarDef.toolPanels?.forEach((toolPanelDef) => {
        const { id } = toolPanelDef;
        if (!id) {
          return;
        }
        const existingToolPanelDef = this.sideBar.toolPanels?.find(
          (toolPanelDefToCheck) => toolPanelDefToCheck.id === id
        );
        if (!existingToolPanelDef || toolPanelDef.toolPanel !== existingToolPanelDef.toolPanel) {
          return;
        }
        const toolPanelWrapper = this.toolPanelWrappers.find((toolPanel) => toolPanel.getToolPanelId() === id);
        if (!toolPanelWrapper) {
          return;
        }
        const params = this.gos.addGridCommonParams({
          ...toolPanelDef.toolPanelParams ?? {},
          onStateUpdated: () => this.eventService.dispatchEvent({ type: "sideBarUpdated" })
        });
        const hasRefreshed = toolPanelWrapper.getToolPanelInstance()?.refresh(params);
        if (hasRefreshed !== true) {
          return;
        }
        this.toolPanelWrappers = this.toolPanelWrappers.filter((toolPanel) => toolPanel !== toolPanelWrapper);
        (0, import_core8._removeFromParent)(toolPanelWrapper.getGui());
        existingToolPanelWrappers[id] = toolPanelWrapper;
      });
    }
    this.clearDownUi();
    this.setSideBarDef({ sideBarDef, existingToolPanelWrappers });
  }
  destroyToolPanelWrappers() {
    this.toolPanelWrappers.forEach((wrapper) => {
      (0, import_core8._removeFromParent)(wrapper.getGui());
      this.destroyBean(wrapper);
    });
    this.toolPanelWrappers.length = 0;
  }
  destroy() {
    this.destroyToolPanelWrappers();
    super.destroy();
  }
};
var AgSideBarSelector = {
  selector: "AG-SIDE-BAR",
  component: AgSideBar
};

// enterprise-modules/side-bar/src/sideBar/sideBarService.ts
var SideBarService = class extends import_core9.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "sideBarService";
  }
  registerSideBarComp(sideBarComp) {
    this.sideBarComp = sideBarComp;
  }
  getSideBarComp() {
    return this.sideBarComp;
  }
  getSideBarSelector() {
    return AgSideBarSelector;
  }
};

// enterprise-modules/side-bar/src/version.ts
var VERSION = "32.0.1";

// enterprise-modules/side-bar/src/sideBarModule.ts
var SideBarCoreModule = {
  version: VERSION,
  moduleName: `${import_core10.ModuleNames.SideBarModule}-core`,
  beans: [ToolPanelColDefService, SideBarService],
  dependantModules: [import_core11.EnterpriseCoreModule]
};
var SideBarApiModule = {
  version: VERSION,
  moduleName: `${import_core10.ModuleNames.SideBarModule}-api`,
  apiFunctions: {
    isSideBarVisible,
    setSideBarVisible,
    setSideBarPosition,
    openToolPanel,
    closeToolPanel,
    getOpenedToolPanel,
    refreshToolPanel,
    isToolPanelShowing,
    getToolPanelInstance,
    getSideBar
  },
  dependantModules: [SideBarCoreModule]
};
var SideBarModule = {
  version: VERSION,
  moduleName: import_core10.ModuleNames.SideBarModule,
  dependantModules: [SideBarCoreModule, SideBarApiModule]
};
