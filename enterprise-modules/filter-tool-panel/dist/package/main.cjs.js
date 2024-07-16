var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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

// enterprise-modules/filter-tool-panel/src/main.ts
var main_exports = {};
__export(main_exports, {
  FiltersToolPanelModule: () => FiltersToolPanelModule
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/filter-tool-panel/src/filtersToolPanelModule.ts
var import_core6 = require("@ag-grid-community/core");
var import_core7 = require("@ag-grid-enterprise/core");

// enterprise-modules/filter-tool-panel/src/filterToolPanel/filtersToolPanelHeaderPanel.ts
var import_core = require("@ag-grid-community/core");
var FiltersToolPanelHeaderPanel = class extends import_core.Component {
  preConstruct() {
    this.setTemplate(
      /* html */
      `<div class="ag-filter-toolpanel-search" role="presentation">
                <div ref="eExpand" class="ag-filter-toolpanel-expand"></div>
                <ag-input-text-field ref="eFilterTextField" class="ag-filter-toolpanel-search-input"></ag-input-text-field>
            </div>`
    );
  }
  postConstruct() {
    const translate = this.localeService.getLocaleTextFunc();
    this.eFilterTextField.setAutoComplete(false).setInputAriaLabel(translate("ariaFilterColumnsInput", "Filter Columns Input")).onValueChange(this.onSearchTextChanged.bind(this));
    this.createExpandIcons();
    this.setExpandState(0 /* EXPANDED */);
    this.addManagedListener(this.eExpand, "click", this.onExpandClicked.bind(this));
    this.addManagedListener(this.eventService, import_core.Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
  }
  init(params) {
    this.params = params;
    if (this.columnModel.isReady()) {
      this.showOrHideOptions();
    }
  }
  createExpandIcons() {
    this.eExpand.appendChild(this.eExpandChecked = import_core._.createIconNoSpan("columnSelectOpen", this.gos));
    this.eExpand.appendChild(this.eExpandUnchecked = import_core._.createIconNoSpan("columnSelectClosed", this.gos));
    this.eExpand.appendChild(this.eExpandIndeterminate = import_core._.createIconNoSpan("columnSelectIndeterminate", this.gos));
  }
  // we only show expand / collapse if we are showing filters
  showOrHideOptions() {
    const showFilterSearch = !this.params.suppressFilterSearch;
    const showExpand = !this.params.suppressExpandAll;
    const translate = this.localeService.getLocaleTextFunc();
    this.eFilterTextField.setInputPlaceholder(translate("searchOoo", "Search..."));
    const isFilterGroupPresent = (col) => col.getOriginalParent() && col.isFilterAllowed();
    const filterGroupsPresent = this.columnModel.getAllGridColumns().some(isFilterGroupPresent);
    import_core._.setDisplayed(this.eFilterTextField.getGui(), showFilterSearch);
    import_core._.setDisplayed(this.eExpand, showExpand && filterGroupsPresent);
  }
  onSearchTextChanged() {
    if (!this.onSearchTextChangedDebounced) {
      this.onSearchTextChangedDebounced = import_core._.debounce(() => {
        this.dispatchEvent({ type: "searchChanged", searchText: this.eFilterTextField.getValue() });
      }, 300);
    }
    this.onSearchTextChangedDebounced();
  }
  onExpandClicked() {
    const event = this.currentExpandState === 0 /* EXPANDED */ ? { type: "collapseAll" } : { type: "expandAll" };
    this.dispatchEvent(event);
  }
  setExpandState(state) {
    this.currentExpandState = state;
    import_core._.setDisplayed(this.eExpandChecked, this.currentExpandState === 0 /* EXPANDED */);
    import_core._.setDisplayed(this.eExpandUnchecked, this.currentExpandState === 1 /* COLLAPSED */);
    import_core._.setDisplayed(this.eExpandIndeterminate, this.currentExpandState === 2 /* INDETERMINATE */);
  }
};
__decorateClass([
  (0, import_core.Autowired)("columnModel")
], FiltersToolPanelHeaderPanel.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core.RefSelector)("eExpand")
], FiltersToolPanelHeaderPanel.prototype, "eExpand", 2);
__decorateClass([
  (0, import_core.RefSelector)("eFilterTextField")
], FiltersToolPanelHeaderPanel.prototype, "eFilterTextField", 2);
__decorateClass([
  import_core.PreConstruct
], FiltersToolPanelHeaderPanel.prototype, "preConstruct", 1);
__decorateClass([
  import_core.PostConstruct
], FiltersToolPanelHeaderPanel.prototype, "postConstruct", 1);

// enterprise-modules/filter-tool-panel/src/filterToolPanel/filtersToolPanelListPanel.ts
var import_core4 = require("@ag-grid-community/core");

// enterprise-modules/filter-tool-panel/src/filterToolPanel/toolPanelFilterComp.ts
var import_core2 = require("@ag-grid-community/core");
var _ToolPanelFilterComp = class _ToolPanelFilterComp extends import_core2.Component {
  constructor(hideHeader, expandedCallback) {
    super(_ToolPanelFilterComp.TEMPLATE);
    this.expandedCallback = expandedCallback;
    this.expanded = false;
    this.hideHeader = hideHeader;
  }
  postConstruct() {
    this.eExpandChecked = import_core2._.createIconNoSpan("columnSelectOpen", this.gos);
    this.eExpandUnchecked = import_core2._.createIconNoSpan("columnSelectClosed", this.gos);
    this.eExpand.appendChild(this.eExpandChecked);
    this.eExpand.appendChild(this.eExpandUnchecked);
  }
  setColumn(column) {
    this.column = column;
    this.eFilterName.innerText = this.columnModel.getDisplayNameForColumn(this.column, "filterToolPanel", false) || "";
    this.addManagedListener(this.eFilterToolPanelHeader, "click", this.toggleExpanded.bind(this));
    this.addManagedListener(this.eFilterToolPanelHeader, "keydown", this.onKeyDown.bind(this));
    this.addManagedListener(this.eventService, import_core2.Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
    this.addInIcon("filter", this.eFilterIcon, this.column);
    import_core2._.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
    import_core2._.setDisplayed(this.eExpandChecked, false);
    if (this.hideHeader) {
      import_core2._.setDisplayed(this.eFilterToolPanelHeader, false);
      this.eFilterToolPanelHeader.removeAttribute("tabindex");
    } else {
      this.eFilterToolPanelHeader.setAttribute("tabindex", "0");
    }
    this.addManagedListener(this.column, import_core2.Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
  }
  onKeyDown(e) {
    const { key } = e;
    const { ENTER, SPACE, LEFT, RIGHT } = import_core2.KeyCode;
    if (key !== ENTER && key !== SPACE && key !== LEFT && key !== RIGHT) {
      return;
    }
    e.preventDefault();
    if (key === ENTER || key === SPACE) {
      this.toggleExpanded();
    } else if (key === import_core2.KeyCode.LEFT) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  getColumn() {
    return this.column;
  }
  getColumnFilterName() {
    return this.columnModel.getDisplayNameForColumn(this.column, "filterToolPanel", false);
  }
  addCssClassToTitleBar(cssClass) {
    this.eFilterToolPanelHeader.classList.add(cssClass);
  }
  addInIcon(iconName, eParent, column) {
    if (eParent == null) {
      return;
    }
    const eIcon = import_core2._.createIconNoSpan(iconName, this.gos, column);
    eParent.appendChild(eIcon);
  }
  isFilterActive() {
    return this.filterManager.isFilterActive(this.column);
  }
  onFilterChanged() {
    import_core2._.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
    this.dispatchEvent({ type: import_core2.Column.EVENT_FILTER_CHANGED });
  }
  toggleExpanded() {
    this.expanded ? this.collapse() : this.expand();
  }
  expand() {
    if (this.expanded) {
      return;
    }
    this.expanded = true;
    import_core2._.setAriaExpanded(this.eFilterToolPanelHeader, true);
    import_core2._.setDisplayed(this.eExpandChecked, true);
    import_core2._.setDisplayed(this.eExpandUnchecked, false);
    this.addFilterElement();
    this.expandedCallback();
  }
  addFilterElement(suppressFocus) {
    var _a;
    const filterPanelWrapper = import_core2._.loadTemplate(
      /* html */
      `<div class="ag-filter-toolpanel-instance-filter"></div>`
    );
    const comp = this.createManagedBean(new import_core2.FilterWrapperComp(this.column, "TOOLBAR"));
    this.filterWrapperComp = comp;
    if (!comp.hasFilter()) {
      return;
    }
    (_a = comp.getFilter()) == null ? void 0 : _a.then((filter) => {
      this.underlyingFilter = filter;
      if (!filter) {
        return;
      }
      filterPanelWrapper.appendChild(comp.getGui());
      this.agFilterToolPanelBody.appendChild(filterPanelWrapper);
      comp.afterGuiAttached({ container: "toolPanel", suppressFocus });
    });
  }
  collapse() {
    var _a;
    if (!this.expanded) {
      return;
    }
    this.expanded = false;
    import_core2._.setAriaExpanded(this.eFilterToolPanelHeader, false);
    this.removeFilterElement();
    import_core2._.setDisplayed(this.eExpandChecked, false);
    import_core2._.setDisplayed(this.eExpandUnchecked, true);
    (_a = this.filterWrapperComp) == null ? void 0 : _a.afterGuiDetached();
    this.destroyBean(this.filterWrapperComp);
    this.expandedCallback();
  }
  removeFilterElement() {
    import_core2._.clearElement(this.agFilterToolPanelBody);
  }
  isExpanded() {
    return this.expanded;
  }
  refreshFilter(isDisplayed) {
    var _a;
    if (!this.expanded) {
      return;
    }
    const filter = this.underlyingFilter;
    if (!filter) {
      return;
    }
    if (isDisplayed) {
      if (typeof filter.refreshVirtualList === "function") {
        filter.refreshVirtualList();
      }
    } else {
      (_a = filter.afterGuiDetached) == null ? void 0 : _a.call(filter);
    }
  }
  onFilterOpened(event) {
    if (event.source !== "COLUMN_MENU") {
      return;
    }
    if (event.column !== this.column) {
      return;
    }
    if (!this.expanded) {
      return;
    }
    this.collapse();
  }
};
_ToolPanelFilterComp.TEMPLATE = /* html */
`
        <div class="ag-filter-toolpanel-instance">
            <div class="ag-filter-toolpanel-header ag-filter-toolpanel-instance-header" ref="eFilterToolPanelHeader" role="button" aria-expanded="false">
                <div ref="eExpand" class="ag-filter-toolpanel-expand"></div>
                <span ref="eFilterName" class="ag-header-cell-text"></span>
                <span ref="eFilterIcon" class="ag-header-icon ag-filter-icon ag-filter-toolpanel-instance-header-icon" aria-hidden="true"></span>
            </div>
            <div class="ag-filter-toolpanel-instance-body ag-filter" ref="agFilterToolPanelBody"></div>
        </div>`;
__decorateClass([
  (0, import_core2.RefSelector)("eFilterToolPanelHeader")
], _ToolPanelFilterComp.prototype, "eFilterToolPanelHeader", 2);
__decorateClass([
  (0, import_core2.RefSelector)("eFilterName")
], _ToolPanelFilterComp.prototype, "eFilterName", 2);
__decorateClass([
  (0, import_core2.RefSelector)("agFilterToolPanelBody")
], _ToolPanelFilterComp.prototype, "agFilterToolPanelBody", 2);
__decorateClass([
  (0, import_core2.RefSelector)("eFilterIcon")
], _ToolPanelFilterComp.prototype, "eFilterIcon", 2);
__decorateClass([
  (0, import_core2.RefSelector)("eExpand")
], _ToolPanelFilterComp.prototype, "eExpand", 2);
__decorateClass([
  (0, import_core2.Autowired)("filterManager")
], _ToolPanelFilterComp.prototype, "filterManager", 2);
__decorateClass([
  (0, import_core2.Autowired)("columnModel")
], _ToolPanelFilterComp.prototype, "columnModel", 2);
__decorateClass([
  import_core2.PostConstruct
], _ToolPanelFilterComp.prototype, "postConstruct", 1);
var ToolPanelFilterComp = _ToolPanelFilterComp;

// enterprise-modules/filter-tool-panel/src/filterToolPanel/toolPanelFilterGroupComp.ts
var import_core3 = require("@ag-grid-community/core");
var _ToolPanelFilterGroupComp = class _ToolPanelFilterGroupComp extends import_core3.Component {
  constructor(columnGroup, childFilterComps, expandedCallback, depth, showingColumn) {
    super();
    this.columnGroup = columnGroup;
    this.childFilterComps = childFilterComps;
    this.depth = depth;
    this.expandedCallback = expandedCallback;
    this.showingColumn = showingColumn;
  }
  preConstruct() {
    const groupParams = {
      cssIdentifier: "filter-toolpanel",
      direction: "vertical"
    };
    this.setTemplate(_ToolPanelFilterGroupComp.TEMPLATE, { filterGroupComp: groupParams });
  }
  init() {
    this.setGroupTitle();
    this.filterGroupComp.setAlignItems("stretch");
    this.filterGroupComp.addCssClass(`ag-filter-toolpanel-group-level-${this.depth}`);
    this.filterGroupComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth}-header`);
    this.childFilterComps.forEach((filterComp) => {
      this.filterGroupComp.addItem(filterComp);
      filterComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth + 1}-header`);
    });
    this.refreshFilterClass();
    this.addExpandCollapseListeners();
    this.addFilterChangedListeners();
    this.setupTooltip();
    this.addInIcon("filter");
  }
  setupTooltip() {
    if (!this.showingColumn) {
      return;
    }
    const isTooltipWhenTruncated = this.gos.get("tooltipShowMode") === "whenTruncated";
    let shouldDisplayTooltip;
    if (isTooltipWhenTruncated) {
      shouldDisplayTooltip = () => {
        const eGui = this.filterGroupComp.getGui();
        const eTitle = eGui.querySelector(".ag-group-title");
        if (!eTitle) {
          return true;
        }
        return eTitle.scrollWidth > eTitle.clientWidth;
      };
    }
    const refresh = () => {
      const newTooltipText = this.columnGroup.getColDef().headerTooltip;
      this.setTooltip({ newTooltipText, location: "filterToolPanelColumnGroup", shouldDisplayTooltip });
    };
    refresh();
    this.addManagedListener(this.eventService, import_core3.Events.EVENT_NEW_COLUMNS_LOADED, refresh);
  }
  getTooltipParams() {
    const res = super.getTooltipParams();
    res.location = "filterToolPanelColumnGroup";
    return res;
  }
  addCssClassToTitleBar(cssClass) {
    this.filterGroupComp.addCssClassToTitleBar(cssClass);
  }
  refreshFilters(isDisplayed) {
    this.childFilterComps.forEach((filterComp) => {
      if (filterComp instanceof _ToolPanelFilterGroupComp) {
        filterComp.refreshFilters(isDisplayed);
      } else {
        filterComp.refreshFilter(isDisplayed);
      }
    });
  }
  isColumnGroup() {
    return this.columnGroup instanceof import_core3.ProvidedColumnGroup;
  }
  isExpanded() {
    return this.filterGroupComp.isExpanded();
  }
  getChildren() {
    return this.childFilterComps;
  }
  getFilterGroupName() {
    return this.filterGroupName ? this.filterGroupName : "";
  }
  getFilterGroupId() {
    return this.columnGroup.getId();
  }
  hideGroupItem(hide, index) {
    this.filterGroupComp.hideItem(hide, index);
  }
  hideGroup(hide) {
    this.setDisplayed(!hide);
  }
  addInIcon(iconName) {
    const eIcon = import_core3._.createIconNoSpan(iconName, this.gos);
    if (eIcon) {
      eIcon.classList.add("ag-filter-toolpanel-group-instance-header-icon");
    }
    this.filterGroupComp.addTitleBarWidget(eIcon);
  }
  forEachToolPanelFilterChild(action) {
    this.childFilterComps.forEach((filterComp) => {
      if (filterComp instanceof ToolPanelFilterComp) {
        action(filterComp);
      }
    });
  }
  addExpandCollapseListeners() {
    const expandListener = this.isColumnGroup() ? () => this.expandedCallback() : () => this.forEachToolPanelFilterChild((filterComp) => filterComp.expand());
    const collapseListener = this.isColumnGroup() ? () => this.expandedCallback() : () => this.forEachToolPanelFilterChild((filterComp) => filterComp.collapse());
    this.addManagedListener(this.filterGroupComp, import_core3.AgGroupComponent.EVENT_EXPANDED, expandListener);
    this.addManagedListener(this.filterGroupComp, import_core3.AgGroupComponent.EVENT_COLLAPSED, collapseListener);
  }
  getColumns() {
    if (this.columnGroup instanceof import_core3.ProvidedColumnGroup) {
      return this.columnGroup.getLeafColumns();
    }
    return [this.columnGroup];
  }
  addFilterChangedListeners() {
    this.getColumns().forEach((column) => {
      this.addManagedListener(column, import_core3.Column.EVENT_FILTER_CHANGED, () => this.refreshFilterClass());
    });
    if (!(this.columnGroup instanceof import_core3.ProvidedColumnGroup)) {
      this.addManagedListener(this.eventService, import_core3.Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
    }
  }
  refreshFilterClass() {
    const columns = this.getColumns();
    const anyChildFiltersActive = () => columns.some((col) => col.isFilterActive());
    this.filterGroupComp.addOrRemoveCssClass("ag-has-filter", anyChildFiltersActive());
  }
  onFilterOpened(event) {
    if (event.source !== "COLUMN_MENU") {
      return;
    }
    if (event.column !== this.columnGroup) {
      return;
    }
    if (!this.isExpanded()) {
      return;
    }
    this.collapse();
  }
  expand() {
    this.filterGroupComp.toggleGroupExpand(true);
  }
  collapse() {
    this.filterGroupComp.toggleGroupExpand(false);
  }
  setGroupTitle() {
    this.filterGroupName = this.columnGroup instanceof import_core3.ProvidedColumnGroup ? this.getColumnGroupName(this.columnGroup) : this.getColumnName(this.columnGroup);
    this.filterGroupComp.setTitle(this.filterGroupName || "");
  }
  getColumnGroupName(columnGroup) {
    return this.columnModel.getDisplayNameForProvidedColumnGroup(null, columnGroup, "filterToolPanel");
  }
  getColumnName(column) {
    return this.columnModel.getDisplayNameForColumn(column, "filterToolPanel", false);
  }
  destroyFilters() {
    this.childFilterComps = this.destroyBeans(this.childFilterComps);
    import_core3._.clearElement(this.getGui());
  }
  destroy() {
    this.destroyFilters();
    super.destroy();
  }
};
_ToolPanelFilterGroupComp.TEMPLATE = /* html */
`<div class="ag-filter-toolpanel-group-wrapper">
            <ag-group-component ref="filterGroupComp"></ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core3.RefSelector)("filterGroupComp")
], _ToolPanelFilterGroupComp.prototype, "filterGroupComp", 2);
__decorateClass([
  (0, import_core3.Autowired)("columnModel")
], _ToolPanelFilterGroupComp.prototype, "columnModel", 2);
__decorateClass([
  import_core3.PreConstruct
], _ToolPanelFilterGroupComp.prototype, "preConstruct", 1);
__decorateClass([
  import_core3.PostConstruct
], _ToolPanelFilterGroupComp.prototype, "init", 1);
var ToolPanelFilterGroupComp = _ToolPanelFilterGroupComp;

// enterprise-modules/filter-tool-panel/src/filterToolPanel/filtersToolPanelListPanel.ts
var _FiltersToolPanelListPanel = class _FiltersToolPanelListPanel extends import_core4.Component {
  constructor() {
    super(_FiltersToolPanelListPanel.TEMPLATE);
    this.initialised = false;
    this.hasLoadedInitialState = false;
    this.isInitialState = false;
    this.filterGroupComps = [];
    // If a column drag is happening, we suppress handling the event until it has completed
    this.suppressOnColumnsChanged = false;
    this.onColumnsChangedPending = false;
  }
  init(params) {
    this.initialised = true;
    const defaultParams = this.gos.addGridCommonParams({
      suppressExpandAll: false,
      suppressFilterSearch: false,
      suppressSyncLayoutWithGrid: false
    });
    import_core4._.mergeDeep(defaultParams, params);
    this.params = defaultParams;
    if (!this.params.suppressSyncLayoutWithGrid) {
      this.addManagedListener(this.eventService, import_core4.Events.EVENT_COLUMN_MOVED, () => this.onColumnsChanged());
    }
    this.addManagedListener(this.eventService, import_core4.Events.EVENT_NEW_COLUMNS_LOADED, () => this.onColumnsChanged());
    this.addManagedListener(this.eventService, import_core4.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED, (event) => {
      if (event.key === "filters") {
        this.refreshFilters(event.visible);
      }
    });
    this.addManagedListener(this.eventService, import_core4.Events.EVENT_DRAG_STARTED, () => {
      this.suppressOnColumnsChanged = true;
    });
    this.addManagedListener(this.eventService, import_core4.Events.EVENT_DRAG_STOPPED, () => {
      this.suppressOnColumnsChanged = false;
      if (this.onColumnsChangedPending) {
        this.onColumnsChangedPending = false;
        this.onColumnsChanged();
      }
    });
    if (this.columnModel.isReady()) {
      this.onColumnsChanged();
    }
  }
  onColumnsChanged() {
    if (this.suppressOnColumnsChanged) {
      this.onColumnsChangedPending = true;
      return;
    }
    const pivotModeActive = this.columnModel.isPivotMode();
    const shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
    shouldSyncColumnLayoutWithGrid ? this.syncFilterLayout() : this.buildTreeFromProvidedColumnDefs();
    this.refreshAriaLabel();
  }
  syncFilterLayout() {
    this.toolPanelColDefService.syncLayoutWithGrid(this.setFiltersLayout.bind(this));
    this.refreshAriaLabel();
  }
  buildTreeFromProvidedColumnDefs() {
    const columnTree = this.columnModel.getPrimaryColumnTree();
    this.recreateFilters(columnTree);
  }
  setFiltersLayout(colDefs) {
    const columnTree = this.toolPanelColDefService.createColumnTree(colDefs);
    this.recreateFilters(columnTree);
  }
  recreateFilters(columnTree) {
    const activeElement = this.gos.getActiveDomElement();
    if (!this.hasLoadedInitialState) {
      this.hasLoadedInitialState = true;
      this.isInitialState = !!this.params.initialState;
    }
    const expansionState = this.getExpansionState();
    this.destroyFilters();
    this.filterGroupComps = this.recursivelyAddComps(columnTree, 0, expansionState);
    const len = this.filterGroupComps.length;
    if (len) {
      this.filterGroupComps.forEach((comp) => this.appendChild(comp));
      this.setFirstAndLastVisible(0, len - 1);
    }
    if (import_core4._.exists(this.searchFilterText)) {
      this.searchFilters(this.searchFilterText);
    }
    this.fireExpandedEvent();
    if (this.getGui().contains(activeElement)) {
      activeElement.focus();
    }
    this.isInitialState = false;
    this.refreshAriaLabel();
  }
  recursivelyAddComps(tree, depth, expansionState) {
    return import_core4._.flatten(tree.map((child) => {
      if (child instanceof import_core4.ProvidedColumnGroup) {
        return import_core4._.flatten(this.recursivelyAddFilterGroupComps(child, depth, expansionState));
      }
      const column = child;
      if (!this.shouldDisplayFilter(column)) {
        return [];
      }
      const hideFilterCompHeader = depth === 0;
      const filterComp = new ToolPanelFilterComp(hideFilterCompHeader, () => this.onFilterExpanded());
      this.createBean(filterComp);
      filterComp.setColumn(column);
      if (expansionState.get(column.getId())) {
        filterComp.expand();
      }
      if (depth > 0) {
        return filterComp;
      }
      const filterGroupComp = this.createBean(new ToolPanelFilterGroupComp(column, [filterComp], this.onGroupExpanded.bind(this), depth, true));
      filterGroupComp.addCssClassToTitleBar("ag-filter-toolpanel-header");
      if (!expansionState.get(filterGroupComp.getFilterGroupId())) {
        filterGroupComp.collapse();
      }
      return filterGroupComp;
    }));
  }
  refreshAriaLabel() {
    const translate = this.localeService.getLocaleTextFunc();
    const filterListName = translate("ariaFilterPanelList", "Filter List");
    const localeFilters = translate("filters", "Filters");
    const eGui = this.getGui();
    const groupSelector = ".ag-filter-toolpanel-group-wrapper";
    const itemSelector = ".ag-filter-toolpanel-group-item";
    const hiddenSelector = ".ag-hidden";
    const visibleItems = eGui.querySelectorAll(`${itemSelector}:not(${groupSelector}, ${hiddenSelector})`);
    const totalVisibleItems = visibleItems.length;
    import_core4._.setAriaLabel(this.getAriaElement(), `${filterListName} ${totalVisibleItems} ${localeFilters}`);
  }
  recursivelyAddFilterGroupComps(columnGroup, depth, expansionState) {
    if (!this.filtersExistInChildren(columnGroup.getChildren())) {
      return;
    }
    const colGroupDef = columnGroup.getColGroupDef();
    if (colGroupDef && colGroupDef.suppressFiltersToolPanel) {
      return [];
    }
    const newDepth = columnGroup.isPadding() ? depth : depth + 1;
    const childFilterComps = import_core4._.flatten(this.recursivelyAddComps(columnGroup.getChildren(), newDepth, expansionState));
    if (columnGroup.isPadding()) {
      return childFilterComps;
    }
    const filterGroupComp = new ToolPanelFilterGroupComp(columnGroup, childFilterComps, this.onGroupExpanded.bind(this), depth, false);
    this.createBean(filterGroupComp);
    filterGroupComp.addCssClassToTitleBar("ag-filter-toolpanel-header");
    const expansionStateValue = expansionState.get(filterGroupComp.getFilterGroupId());
    if (this.isInitialState && !expansionStateValue || expansionStateValue === false) {
      filterGroupComp.collapse();
    }
    return [filterGroupComp];
  }
  filtersExistInChildren(tree) {
    return tree.some((child) => {
      if (child instanceof import_core4.ProvidedColumnGroup) {
        return this.filtersExistInChildren(child.getChildren());
      }
      return this.shouldDisplayFilter(child);
    });
  }
  shouldDisplayFilter(column) {
    const suppressFiltersToolPanel = column.getColDef() && column.getColDef().suppressFiltersToolPanel;
    return column.isFilterAllowed() && !suppressFiltersToolPanel;
  }
  getExpansionState() {
    const expansionState = /* @__PURE__ */ new Map();
    if (this.isInitialState) {
      const { expandedColIds, expandedGroupIds } = this.params.initialState;
      expandedColIds.forEach((id) => expansionState.set(id, true));
      expandedGroupIds.forEach((id) => expansionState.set(id, true));
      return expansionState;
    }
    const recursiveGetExpansionState = (filterGroupComp) => {
      expansionState.set(filterGroupComp.getFilterGroupId(), filterGroupComp.isExpanded());
      filterGroupComp.getChildren().forEach((child) => {
        if (child instanceof ToolPanelFilterGroupComp) {
          recursiveGetExpansionState(child);
        } else {
          expansionState.set(child.getColumn().getId(), child.isExpanded());
        }
      });
    };
    this.filterGroupComps.forEach(recursiveGetExpansionState);
    return expansionState;
  }
  // we don't support refreshing, but must implement because it's on the tool panel interface
  refresh() {
  }
  // lazy initialise the panel
  setVisible(visible) {
    super.setDisplayed(visible);
    if (visible && !this.initialised) {
      this.init(this.params);
    }
  }
  expandFilterGroups(expand, groupIds) {
    const updatedGroupIds = [];
    const updateGroupExpandState = (filterGroup) => {
      const groupId = filterGroup.getFilterGroupId();
      const shouldExpandOrCollapse = !groupIds || import_core4._.includes(groupIds, groupId);
      if (shouldExpandOrCollapse) {
        if (expand && filterGroup.isColumnGroup()) {
          filterGroup.expand();
        } else {
          filterGroup.collapse();
        }
        updatedGroupIds.push(groupId);
      }
      filterGroup.getChildren().forEach((child) => {
        if (child instanceof ToolPanelFilterGroupComp) {
          updateGroupExpandState(child);
        }
      });
    };
    this.filterGroupComps.forEach(updateGroupExpandState);
    this.onGroupExpanded();
    if (groupIds) {
      const unrecognisedGroupIds = groupIds.filter((groupId) => updatedGroupIds.indexOf(groupId) < 0);
      if (unrecognisedGroupIds.length > 0) {
        console.warn("AG Grid: unable to find groups for these supplied groupIds:", unrecognisedGroupIds);
      }
    }
  }
  expandFilters(expand, colIds) {
    const updatedColIds = [];
    const updateGroupExpandState = (filterComp) => {
      if (filterComp instanceof ToolPanelFilterGroupComp) {
        let anyChildrenChanged = false;
        filterComp.getChildren().forEach((child) => {
          const childUpdated = updateGroupExpandState(child);
          if (childUpdated) {
            if (expand) {
              filterComp.expand();
              anyChildrenChanged = true;
            } else if (!filterComp.isColumnGroup()) {
              filterComp.collapse();
            }
          }
        });
        return anyChildrenChanged;
      }
      const colId = filterComp.getColumn().getColId();
      const updateFilterExpandState = !colIds || import_core4._.includes(colIds, colId);
      if (updateFilterExpandState) {
        expand ? filterComp.expand() : filterComp.collapse();
        updatedColIds.push(colId);
      }
      return updateFilterExpandState;
    };
    this.filterGroupComps.forEach(updateGroupExpandState);
    this.onGroupExpanded();
    if (colIds) {
      const unrecognisedColIds = colIds.filter((colId) => updatedColIds.indexOf(colId) < 0);
      if (unrecognisedColIds.length > 0) {
        console.warn("AG Grid: unable to find columns for these supplied colIds:", unrecognisedColIds);
      }
    }
  }
  onGroupExpanded() {
    this.fireExpandedEvent();
  }
  onFilterExpanded() {
    this.dispatchEvent({ type: "filterExpanded" });
  }
  fireExpandedEvent() {
    let expandedCount = 0;
    let notExpandedCount = 0;
    const updateExpandCounts = (filterGroup) => {
      if (!filterGroup.isColumnGroup()) {
        return;
      }
      filterGroup.isExpanded() ? expandedCount++ : notExpandedCount++;
      filterGroup.getChildren().forEach((child) => {
        if (child instanceof ToolPanelFilterGroupComp) {
          updateExpandCounts(child);
        }
      });
    };
    this.filterGroupComps.forEach(updateExpandCounts);
    let state;
    if (expandedCount > 0 && notExpandedCount > 0) {
      state = 2 /* INDETERMINATE */;
    } else if (notExpandedCount > 0) {
      state = 1 /* COLLAPSED */;
    } else {
      state = 0 /* EXPANDED */;
    }
    this.dispatchEvent({ type: "groupExpanded", state });
  }
  performFilterSearch(searchText) {
    this.searchFilterText = import_core4._.exists(searchText) ? searchText.toLowerCase() : null;
    this.searchFilters(this.searchFilterText);
  }
  searchFilters(searchFilter) {
    const passesFilter = (groupName) => {
      return !import_core4._.exists(searchFilter) || groupName.toLowerCase().indexOf(searchFilter) !== -1;
    };
    const recursivelySearch = (filterItem, parentPasses) => {
      if (!(filterItem instanceof ToolPanelFilterGroupComp)) {
        return passesFilter(filterItem.getColumnFilterName() || "");
      }
      const children = filterItem.getChildren();
      const groupNamePasses = passesFilter(filterItem.getFilterGroupName());
      const alreadyPassed = parentPasses || groupNamePasses;
      if (alreadyPassed) {
        filterItem.hideGroup(false);
        for (let i = 0; i < children.length; i++) {
          recursivelySearch(children[i], alreadyPassed);
          filterItem.hideGroupItem(false, i);
        }
        return true;
      }
      let anyChildPasses = false;
      children.forEach((child, index) => {
        const childPasses = recursivelySearch(child, parentPasses);
        filterItem.hideGroupItem(!childPasses, index);
        if (childPasses) {
          anyChildPasses = true;
        }
      });
      filterItem.hideGroup(!anyChildPasses);
      return anyChildPasses;
    };
    let firstVisible;
    let lastVisible;
    this.filterGroupComps.forEach((filterGroup, idx) => {
      recursivelySearch(filterGroup, false);
      if (firstVisible === void 0) {
        if (!filterGroup.containsCssClass("ag-hidden")) {
          firstVisible = idx;
          lastVisible = idx;
        }
      } else if (!filterGroup.containsCssClass("ag-hidden") && lastVisible !== idx) {
        lastVisible = idx;
      }
    });
    this.setFirstAndLastVisible(firstVisible, lastVisible);
    this.refreshAriaLabel();
  }
  setFirstAndLastVisible(firstIdx, lastIdx) {
    this.filterGroupComps.forEach((filterGroup, idx) => {
      filterGroup.removeCssClass("ag-first-group-visible");
      filterGroup.removeCssClass("ag-last-group-visible");
      if (idx === firstIdx) {
        filterGroup.addCssClass("ag-first-group-visible");
      }
      if (idx === lastIdx) {
        filterGroup.addCssClass("ag-last-group-visible");
      }
    });
  }
  refreshFilters(isDisplayed) {
    this.filterGroupComps.forEach((filterGroupComp) => filterGroupComp.refreshFilters(isDisplayed));
  }
  getExpandedFiltersAndGroups() {
    const expandedGroupIds = [];
    const expandedColIds = /* @__PURE__ */ new Set();
    const getExpandedFiltersAndGroups = (filterComp) => {
      if (filterComp instanceof ToolPanelFilterGroupComp) {
        filterComp.getChildren().forEach((child) => getExpandedFiltersAndGroups(child));
        const groupId = filterComp.getFilterGroupId();
        if (filterComp.isExpanded() && !expandedColIds.has(groupId)) {
          expandedGroupIds.push(groupId);
        }
      } else {
        if (filterComp.isExpanded()) {
          expandedColIds.add(filterComp.getColumn().getColId());
        }
      }
    };
    this.filterGroupComps.forEach(getExpandedFiltersAndGroups);
    return { expandedGroupIds, expandedColIds: Array.from(expandedColIds) };
  }
  destroyFilters() {
    this.filterGroupComps = this.destroyBeans(this.filterGroupComps);
    import_core4._.clearElement(this.getGui());
  }
  destroy() {
    this.destroyFilters();
    super.destroy();
  }
};
_FiltersToolPanelListPanel.TEMPLATE = /* html */
`<div class="ag-filter-list-panel"></div>`;
__decorateClass([
  (0, import_core4.Autowired)("toolPanelColDefService")
], _FiltersToolPanelListPanel.prototype, "toolPanelColDefService", 2);
__decorateClass([
  (0, import_core4.Autowired)("columnModel")
], _FiltersToolPanelListPanel.prototype, "columnModel", 2);
var FiltersToolPanelListPanel = _FiltersToolPanelListPanel;

// enterprise-modules/filter-tool-panel/src/filterToolPanel/filtersToolPanel.ts
var import_core5 = require("@ag-grid-community/core");
var _FiltersToolPanel = class _FiltersToolPanel extends import_core5.Component {
  constructor() {
    super(_FiltersToolPanel.TEMPLATE);
    this.initialised = false;
    this.listenerDestroyFuncs = [];
  }
  init(params) {
    if (this.initialised) {
      this.listenerDestroyFuncs.forEach((func) => func());
      this.listenerDestroyFuncs = [];
    }
    this.initialised = true;
    const defaultParams = this.gos.addGridCommonParams({
      suppressExpandAll: false,
      suppressFilterSearch: false,
      suppressSyncLayoutWithGrid: false
    });
    this.params = __spreadValues(__spreadValues({}, defaultParams), params);
    this.filtersToolPanelHeaderPanel.init(this.params);
    this.filtersToolPanelListPanel.init(this.params);
    const hideExpand = this.params.suppressExpandAll;
    const hideSearch = this.params.suppressFilterSearch;
    if (hideExpand && hideSearch) {
      this.filtersToolPanelHeaderPanel.setDisplayed(false);
    }
    this.listenerDestroyFuncs.push(
      this.addManagedListener(this.filtersToolPanelHeaderPanel, "expandAll", this.onExpandAll.bind(this)),
      this.addManagedListener(this.filtersToolPanelHeaderPanel, "collapseAll", this.onCollapseAll.bind(this)),
      this.addManagedListener(this.filtersToolPanelHeaderPanel, "searchChanged", this.onSearchChanged.bind(this)),
      this.addManagedListener(this.filtersToolPanelListPanel, "filterExpanded", this.onFilterExpanded.bind(this)),
      this.addManagedListener(this.filtersToolPanelListPanel, "groupExpanded", this.onGroupExpanded.bind(this))
    );
  }
  // lazy initialise the panel
  setVisible(visible) {
    super.setDisplayed(visible);
    if (visible && !this.initialised) {
      this.init(this.params);
    }
  }
  onExpandAll() {
    this.filtersToolPanelListPanel.expandFilterGroups(true);
  }
  onCollapseAll() {
    this.filtersToolPanelListPanel.expandFilterGroups(false);
  }
  onSearchChanged(event) {
    this.filtersToolPanelListPanel.performFilterSearch(event.searchText);
  }
  setFilterLayout(colDefs) {
    this.filtersToolPanelListPanel.setFiltersLayout(colDefs);
  }
  onFilterExpanded() {
    this.params.onStateUpdated();
  }
  onGroupExpanded(event) {
    this.filtersToolPanelHeaderPanel.setExpandState(event.state);
    this.params.onStateUpdated();
  }
  expandFilterGroups(groupIds) {
    this.filtersToolPanelListPanel.expandFilterGroups(true, groupIds);
  }
  collapseFilterGroups(groupIds) {
    this.filtersToolPanelListPanel.expandFilterGroups(false, groupIds);
  }
  expandFilters(colIds) {
    this.filtersToolPanelListPanel.expandFilters(true, colIds);
  }
  collapseFilters(colIds) {
    this.filtersToolPanelListPanel.expandFilters(false, colIds);
  }
  syncLayoutWithGrid() {
    this.filtersToolPanelListPanel.syncFilterLayout();
  }
  refresh(params) {
    this.init(params);
    return true;
  }
  getState() {
    return this.filtersToolPanelListPanel.getExpandedFiltersAndGroups();
  }
  // this is a user component, and IComponent has "public destroy()" as part of the interface.
  // so we need to override destroy() just to make the method public.
  destroy() {
    super.destroy();
  }
};
_FiltersToolPanel.TEMPLATE = /* html */
`<div class="ag-filter-toolpanel">
            <ag-filters-tool-panel-header ref="filtersToolPanelHeaderPanel"></ag-filters-tool-panel-header>
            <ag-filters-tool-panel-list ref="filtersToolPanelListPanel"></ag-filters-tool-panel-list>
         </div>`;
__decorateClass([
  (0, import_core5.RefSelector)("filtersToolPanelHeaderPanel")
], _FiltersToolPanel.prototype, "filtersToolPanelHeaderPanel", 2);
__decorateClass([
  (0, import_core5.RefSelector)("filtersToolPanelListPanel")
], _FiltersToolPanel.prototype, "filtersToolPanelListPanel", 2);
var FiltersToolPanel = _FiltersToolPanel;

// enterprise-modules/filter-tool-panel/src/filtersToolPanelModule.ts
var import_side_bar = require("@ag-grid-enterprise/side-bar");

// enterprise-modules/filter-tool-panel/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/filter-tool-panel/src/filtersToolPanelModule.ts
var FiltersToolPanelModule = {
  version: VERSION,
  moduleName: import_core6.ModuleNames.FiltersToolPanelModule,
  beans: [],
  agStackComponents: [
    { componentName: "AgFiltersToolPanelHeader", componentClass: FiltersToolPanelHeaderPanel },
    { componentName: "AgFiltersToolPanelList", componentClass: FiltersToolPanelListPanel }
  ],
  userComponents: [
    { componentName: "agFiltersToolPanel", componentClass: FiltersToolPanel }
  ],
  dependantModules: [
    import_side_bar.SideBarModule,
    import_core7.EnterpriseCoreModule
  ]
};
