// enterprise-modules/side-bar/src/sideBarModule.ts
import { ModuleNames as ModuleNames2 } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/side-bar/src/sideBar/common/toolPanelColDefService.ts
import {
  AgProvidedColumnGroup,
  BeanStub,
  _includes,
  _last,
  _warnOnce,
  isProvidedColumnGroup
} from "@ag-grid-community/core";
var ToolPanelColDefService = class extends BeanStub {
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
        const group = new AgProvidedColumnGroup(groupDef, groupId, false, depth);
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
      _warnOnce("unable to find grid columns for the supplied colDef(s):", invalidColIds);
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
      if (isProvidedColumnGroup(node)) {
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
      const childGroupAlreadyExists = _includes(existingChildIds, this.getId(currentSubGroupToAdd));
      const lastChild = _last(currentSubGroup.children);
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
      const colDefAlreadyPresent = _includes(existingChildIds, this.getId(groupToAdd));
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
import { _unwrapUserComp } from "@ag-grid-community/core";
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
  return _unwrapUserComp(comp);
}
function getSideBar(beans) {
  return beans.sideBarService?.getSideBarComp().getDef();
}

// enterprise-modules/side-bar/src/sideBar/sideBarService.ts
import { BeanStub as BeanStub2 } from "@ag-grid-community/core";

// enterprise-modules/side-bar/src/sideBar/agSideBar.ts
import {
  Component as Component5,
  KeyCode as KeyCode2,
  ManagedFocusFeature,
  ModuleNames,
  ModuleRegistry,
  RefPlaceholder as RefPlaceholder2,
  _addFocusableContainerListener,
  _removeFromParent,
  _setAriaControls,
  _warnOnce as _warnOnce4
} from "@ag-grid-community/core";

// enterprise-modules/side-bar/src/sideBar/agSideBarButtons.ts
import { Component as Component2, KeyCode, _clearElement, _last as _last2 } from "@ag-grid-community/core";

// enterprise-modules/side-bar/src/sideBar/sideBarButtonComp.ts
import { Component, RefPlaceholder, _createIconNoSpan, _setAriaExpanded } from "@ag-grid-community/core";
var SideBarButtonComp = class extends Component {
  constructor(toolPanelDef) {
    super();
    this.eToggleButton = RefPlaceholder;
    this.eIconWrapper = RefPlaceholder;
    this.eLabel = RefPlaceholder;
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
    this.eIconWrapper.insertAdjacentElement("afterbegin", _createIconNoSpan(this.toolPanelDef.iconKey, this.gos));
  }
  onButtonPressed() {
    this.dispatchLocalEvent({ type: "toggleButtonClicked" });
  }
  setSelected(selected) {
    this.addOrRemoveCssClass("ag-selected", selected);
    _setAriaExpanded(this.eToggleButton, selected);
  }
  getButtonElement() {
    return this.eToggleButton;
  }
};

// enterprise-modules/side-bar/src/sideBar/agSideBarButtons.ts
var AgSideBarButtons = class extends Component2 {
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
    if (e.key !== KeyCode.TAB || !e.shiftKey) {
      return;
    }
    const lastColumn = _last2(this.visibleColsService.getAllCols());
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
    _clearElement(this.getGui());
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
import { _warnOnce as _warnOnce2 } from "@ag-grid-community/core";
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
  _warnOnce2(
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
import { Component as Component4, _warnOnce as _warnOnce3 } from "@ag-grid-community/core";

// enterprise-modules/side-bar/src/sideBar/agHorizontalResize.ts
import { Component as Component3 } from "@ag-grid-community/core";
var AgHorizontalResize = class extends Component3 {
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
var ToolPanelWrapper = class extends Component4 {
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
      _warnOnce3(`error processing tool panel component ${id}. You need to specify 'toolPanel'`);
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
var AgSideBar = class extends Component5 {
  constructor() {
    super(
      /* html */
      `<div class="ag-side-bar ag-unselectable">
            <ag-side-bar-buttons data-ref="sideBarButtons"></ag-side-bar-buttons>
        </div>`,
      [AgSideBarButtonsSelector]
    );
    this.sideBarButtons = RefPlaceholder2;
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
      new ManagedFocusFeature(eGui, {
        onTabKeyDown: this.onTabKeyDown.bind(this),
        handleKeyDown: this.handleKeyDown.bind(this)
      })
    );
    _addFocusableContainerListener(this, eGui, this.focusService);
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
      case KeyCode2.LEFT:
      case KeyCode2.UP:
        nextPos = Math.max(0, currentPos - 1);
        break;
      case KeyCode2.RIGHT:
      case KeyCode2.DOWN:
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
      _warnOnce4(
        `please review all your toolPanel components, it seems like at least one of them doesn't have an id`
      );
      return false;
    }
    if (def.toolPanel === "agColumnsToolPanel") {
      const moduleMissing = !ModuleRegistry.__assertRegistered(
        ModuleNames.ColumnsToolPanelModule,
        "Column Tool Panel",
        this.gridId
      );
      if (moduleMissing) {
        return false;
      }
    }
    if (def.toolPanel === "agFiltersToolPanel") {
      const moduleMissing = !ModuleRegistry.__assertRegistered(
        ModuleNames.FiltersToolPanelModule,
        "Filters Tool Panel",
        this.gridId
      );
      if (moduleMissing) {
        return false;
      }
      if (this.filterManager?.isAdvancedFilterEnabled()) {
        _warnOnce4(
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
    _setAriaControls(button.getButtonElement(), wrapperGui);
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
      _warnOnce4(`unable to lookup Tool Panel as invalid key supplied: ${key}`);
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
        _removeFromParent(toolPanelWrapper.getGui());
        existingToolPanelWrappers[id] = toolPanelWrapper;
      });
    }
    this.clearDownUi();
    this.setSideBarDef({ sideBarDef, existingToolPanelWrappers });
  }
  destroyToolPanelWrappers() {
    this.toolPanelWrappers.forEach((wrapper) => {
      _removeFromParent(wrapper.getGui());
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
var SideBarService = class extends BeanStub2 {
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
  moduleName: `${ModuleNames2.SideBarModule}-core`,
  beans: [ToolPanelColDefService, SideBarService],
  dependantModules: [EnterpriseCoreModule]
};
var SideBarApiModule = {
  version: VERSION,
  moduleName: `${ModuleNames2.SideBarModule}-api`,
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
  moduleName: ModuleNames2.SideBarModule,
  dependantModules: [SideBarCoreModule, SideBarApiModule]
};
export {
  SideBarModule,
  ToolPanelColDefService
};
