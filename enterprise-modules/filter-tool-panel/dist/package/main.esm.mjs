// enterprise-modules/filter-tool-panel/src/filtersToolPanelModule.ts
import { ModuleNames, _ColumnFilterModule } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { SideBarModule } from "@ag-grid-enterprise/side-bar";

// enterprise-modules/filter-tool-panel/src/filterToolPanel/filtersToolPanel.ts
import { Component as Component5, RefPlaceholder as RefPlaceholder4 } from "@ag-grid-community/core";

// enterprise-modules/filter-tool-panel/src/filterToolPanel/agFiltersToolPanelHeader.ts
import {
  AgInputTextFieldSelector,
  Component,
  RefPlaceholder,
  _createIconNoSpan,
  _debounce,
  _setDisplayed
} from "@ag-grid-community/core";
var AgFiltersToolPanelHeader = class extends Component {
  constructor() {
    super(...arguments);
    this.eExpand = RefPlaceholder;
    this.eFilterTextField = RefPlaceholder;
  }
  wireBeans(beans) {
    this.columnModel = beans.columnModel;
  }
  postConstruct() {
    this.setTemplate(
      /* html */
      `<div class="ag-filter-toolpanel-search" role="presentation">
                <div data-ref="eExpand" class="ag-filter-toolpanel-expand"></div>
                <ag-input-text-field data-ref="eFilterTextField" class="ag-filter-toolpanel-search-input"></ag-input-text-field>
            </div>`,
      [AgInputTextFieldSelector]
    );
    const translate = this.localeService.getLocaleTextFunc();
    this.eFilterTextField.setAutoComplete(false).setInputAriaLabel(translate("ariaFilterColumnsInput", "Filter Columns Input")).onValueChange(this.onSearchTextChanged.bind(this));
    this.createExpandIcons();
    this.setExpandState(0 /* EXPANDED */);
    this.addManagedElementListeners(this.eExpand, { click: this.onExpandClicked.bind(this) });
    this.addManagedEventListeners({ newColumnsLoaded: this.showOrHideOptions.bind(this) });
  }
  init(params) {
    this.params = params;
    if (this.columnModel.isReady()) {
      this.showOrHideOptions();
    }
  }
  createExpandIcons() {
    this.eExpand.appendChild(this.eExpandChecked = _createIconNoSpan("columnSelectOpen", this.gos));
    this.eExpand.appendChild(this.eExpandUnchecked = _createIconNoSpan("columnSelectClosed", this.gos));
    this.eExpand.appendChild(
      this.eExpandIndeterminate = _createIconNoSpan("columnSelectIndeterminate", this.gos)
    );
  }
  // we only show expand / collapse if we are showing filters
  showOrHideOptions() {
    const showFilterSearch = !this.params.suppressFilterSearch;
    const showExpand = !this.params.suppressExpandAll;
    const translate = this.localeService.getLocaleTextFunc();
    this.eFilterTextField.setInputPlaceholder(translate("searchOoo", "Search..."));
    const isFilterGroupPresent = (col) => col.getOriginalParent() && col.isFilterAllowed();
    const filterGroupsPresent = this.columnModel.getCols().some(isFilterGroupPresent);
    _setDisplayed(this.eFilterTextField.getGui(), showFilterSearch);
    _setDisplayed(this.eExpand, showExpand && filterGroupsPresent);
  }
  onSearchTextChanged() {
    if (!this.onSearchTextChangedDebounced) {
      this.onSearchTextChangedDebounced = _debounce(() => {
        this.dispatchLocalEvent({ type: "searchChanged", searchText: this.eFilterTextField.getValue() });
      }, 300);
    }
    this.onSearchTextChangedDebounced();
  }
  onExpandClicked() {
    const event = this.currentExpandState === 0 /* EXPANDED */ ? { type: "collapseAll" } : { type: "expandAll" };
    this.dispatchLocalEvent(event);
  }
  setExpandState(state) {
    this.currentExpandState = state;
    _setDisplayed(this.eExpandChecked, this.currentExpandState === 0 /* EXPANDED */);
    _setDisplayed(this.eExpandUnchecked, this.currentExpandState === 1 /* COLLAPSED */);
    _setDisplayed(this.eExpandIndeterminate, this.currentExpandState === 2 /* INDETERMINATE */);
  }
};
var AgFiltersToolPanelHeaderSelector = {
  selector: "AG-FILTERS-TOOL-PANEL-HEADER",
  component: AgFiltersToolPanelHeader
};

// enterprise-modules/filter-tool-panel/src/filterToolPanel/agFiltersToolPanelList.ts
import {
  Component as Component4,
  _clearElement as _clearElement3,
  _exists,
  _flatten,
  _includes,
  _mergeDeep,
  _setAriaLabel,
  _warnOnce,
  isProvidedColumnGroup as isProvidedColumnGroup2
} from "@ag-grid-community/core";

// enterprise-modules/filter-tool-panel/src/filterToolPanel/toolPanelFilterComp.ts
import {
  Component as Component2,
  FilterWrapperComp,
  KeyCode,
  RefPlaceholder as RefPlaceholder2,
  _clearElement,
  _createIconNoSpan as _createIconNoSpan2,
  _loadTemplate,
  _setAriaExpanded,
  _setDisplayed as _setDisplayed2
} from "@ag-grid-community/core";
var ToolPanelFilterComp = class extends Component2 {
  constructor(hideHeader, expandedCallback) {
    super(
      /* html */
      `
            <div class="ag-filter-toolpanel-instance">
                <div class="ag-filter-toolpanel-header ag-filter-toolpanel-instance-header" data-ref="eFilterToolPanelHeader" role="button" aria-expanded="false">
                    <div data-ref="eExpand" class="ag-filter-toolpanel-expand"></div>
                    <span data-ref="eFilterName" class="ag-header-cell-text"></span>
                    <span data-ref="eFilterIcon" class="ag-header-icon ag-filter-icon ag-filter-toolpanel-instance-header-icon" aria-hidden="true"></span>
                </div>
                <div class="ag-filter-toolpanel-instance-body ag-filter" data-ref="agFilterToolPanelBody"></div>
            </div>`
    );
    this.expandedCallback = expandedCallback;
    this.eFilterToolPanelHeader = RefPlaceholder2;
    this.eFilterName = RefPlaceholder2;
    this.agFilterToolPanelBody = RefPlaceholder2;
    this.eFilterIcon = RefPlaceholder2;
    this.eExpand = RefPlaceholder2;
    this.expanded = false;
    this.hideHeader = hideHeader;
  }
  wireBeans(beans) {
    this.filterManager = beans.filterManager;
    this.columnNameService = beans.columnNameService;
  }
  postConstruct() {
    this.eExpandChecked = _createIconNoSpan2("columnSelectOpen", this.gos);
    this.eExpandUnchecked = _createIconNoSpan2("columnSelectClosed", this.gos);
    this.eExpand.appendChild(this.eExpandChecked);
    this.eExpand.appendChild(this.eExpandUnchecked);
  }
  setColumn(column) {
    this.column = column;
    this.eFilterName.innerText = this.columnNameService.getDisplayNameForColumn(this.column, "filterToolPanel", false) || "";
    this.addManagedListeners(this.eFilterToolPanelHeader, {
      click: this.toggleExpanded.bind(this),
      keydown: this.onKeyDown.bind(this)
    });
    this.addManagedEventListeners({ filterOpened: this.onFilterOpened.bind(this) });
    this.addInIcon("filter", this.eFilterIcon, this.column);
    _setDisplayed2(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
    _setDisplayed2(this.eExpandChecked, false);
    if (this.hideHeader) {
      _setDisplayed2(this.eFilterToolPanelHeader, false);
      this.eFilterToolPanelHeader.removeAttribute("tabindex");
    } else {
      this.eFilterToolPanelHeader.setAttribute("tabindex", "0");
    }
    this.addManagedListeners(this.column, { filterChanged: this.onFilterChanged.bind(this) });
  }
  onKeyDown(e) {
    const { key } = e;
    const { ENTER, SPACE, LEFT, RIGHT } = KeyCode;
    if (key !== ENTER && key !== SPACE && key !== LEFT && key !== RIGHT) {
      return;
    }
    e.preventDefault();
    if (key === ENTER || key === SPACE) {
      this.toggleExpanded();
    } else if (key === KeyCode.LEFT) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  getColumn() {
    return this.column;
  }
  getColumnFilterName() {
    return this.columnNameService.getDisplayNameForColumn(this.column, "filterToolPanel", false);
  }
  addCssClassToTitleBar(cssClass) {
    this.eFilterToolPanelHeader.classList.add(cssClass);
  }
  addInIcon(iconName, eParent, column) {
    if (eParent == null) {
      return;
    }
    const eIcon = _createIconNoSpan2(iconName, this.gos, column);
    eParent.appendChild(eIcon);
  }
  isFilterActive() {
    return !!this.filterManager?.isFilterActive(this.column);
  }
  onFilterChanged() {
    _setDisplayed2(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
    this.dispatchLocalEvent({ type: "filterChanged" });
  }
  toggleExpanded() {
    this.expanded ? this.collapse() : this.expand();
  }
  expand() {
    if (this.expanded) {
      return;
    }
    this.expanded = true;
    _setAriaExpanded(this.eFilterToolPanelHeader, true);
    _setDisplayed2(this.eExpandChecked, true);
    _setDisplayed2(this.eExpandUnchecked, false);
    this.addFilterElement();
    this.expandedCallback();
  }
  addFilterElement(suppressFocus) {
    const filterPanelWrapper = _loadTemplate(
      /* html */
      `<div class="ag-filter-toolpanel-instance-filter"></div>`
    );
    const comp = this.createManagedBean(new FilterWrapperComp(this.column, "TOOLBAR"));
    this.filterWrapperComp = comp;
    if (!comp.hasFilter()) {
      return;
    }
    comp.getFilter()?.then((filter) => {
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
    if (!this.expanded) {
      return;
    }
    this.expanded = false;
    _setAriaExpanded(this.eFilterToolPanelHeader, false);
    this.removeFilterElement();
    _setDisplayed2(this.eExpandChecked, false);
    _setDisplayed2(this.eExpandUnchecked, true);
    this.filterWrapperComp?.afterGuiDetached();
    this.destroyBean(this.filterWrapperComp);
    this.expandedCallback();
  }
  removeFilterElement() {
    _clearElement(this.agFilterToolPanelBody);
  }
  isExpanded() {
    return this.expanded;
  }
  refreshFilter(isDisplayed) {
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
      filter.afterGuiDetached?.();
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

// enterprise-modules/filter-tool-panel/src/filterToolPanel/toolPanelFilterGroupComp.ts
import {
  Component as Component3,
  RefPlaceholder as RefPlaceholder3,
  _clearElement as _clearElement2,
  _createIconNoSpan as _createIconNoSpan3,
  isProvidedColumnGroup
} from "@ag-grid-community/core";
import { AgGroupComponentSelector } from "@ag-grid-enterprise/core";
var ToolPanelFilterGroupComp = class _ToolPanelFilterGroupComp extends Component3 {
  constructor(columnGroup, childFilterComps, expandedCallback, depth, showingColumn) {
    super();
    this.filterGroupComp = RefPlaceholder3;
    this.columnGroup = columnGroup;
    this.childFilterComps = childFilterComps;
    this.depth = depth;
    this.expandedCallback = expandedCallback;
    this.showingColumn = showingColumn;
  }
  wireBeans(beans) {
    this.columnNameService = beans.columnNameService;
  }
  postConstruct() {
    const groupParams = {
      cssIdentifier: "filter-toolpanel",
      direction: "vertical"
    };
    this.setTemplate(
      /* html */
      `<div class="ag-filter-toolpanel-group-wrapper">
            <ag-group-component data-ref="filterGroupComp"></ag-group-component>
        </div>`,
      [AgGroupComponentSelector],
      { filterGroupComp: groupParams }
    );
    this.setGroupTitle();
    this.filterGroupComp.setAlignItems("stretch");
    this.filterGroupComp.addCssClass(`ag-filter-toolpanel-group-level-${this.depth}`);
    this.filterGroupComp.getGui().style.setProperty("--ag-indentation-level", String(this.depth));
    this.filterGroupComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth}-header`);
    this.childFilterComps.forEach((filterComp) => {
      this.filterGroupComp.addItem(filterComp);
      filterComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth + 1}-header`);
      filterComp.getGui().style.setProperty("--ag-indentation-level", String(this.depth + 1));
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
    this.addManagedEventListeners({ newColumnsLoaded: refresh });
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
    return isProvidedColumnGroup(this.columnGroup);
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
    const eIcon = _createIconNoSpan3(iconName, this.gos);
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
    this.addManagedListeners(this.filterGroupComp, {
      expanded: expandListener,
      collapsed: collapseListener
    });
  }
  getColumns() {
    if (isProvidedColumnGroup(this.columnGroup)) {
      return this.columnGroup.getLeafColumns();
    }
    return [this.columnGroup];
  }
  addFilterChangedListeners() {
    this.getColumns().forEach((column) => {
      this.addManagedListeners(column, { filterChanged: () => this.refreshFilterClass() });
    });
    if (!isProvidedColumnGroup(this.columnGroup)) {
      this.addManagedEventListeners({ filterOpened: this.onFilterOpened.bind(this) });
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
    this.filterGroupName = isProvidedColumnGroup(this.columnGroup) ? this.getColumnGroupName(this.columnGroup) : this.getColumnName(this.columnGroup);
    this.filterGroupComp.setTitle(this.filterGroupName || "");
  }
  getColumnGroupName(columnGroup) {
    return this.columnNameService.getDisplayNameForProvidedColumnGroup(null, columnGroup, "filterToolPanel");
  }
  getColumnName(column) {
    return this.columnNameService.getDisplayNameForColumn(column, "filterToolPanel", false);
  }
  destroyFilters() {
    this.childFilterComps = this.destroyBeans(this.childFilterComps);
    _clearElement2(this.getGui());
  }
  destroy() {
    this.destroyFilters();
    super.destroy();
  }
};

// enterprise-modules/filter-tool-panel/src/filterToolPanel/agFiltersToolPanelList.ts
var AgFiltersToolPanelList = class extends Component4 {
  constructor() {
    super(
      /* html */
      `<div class="ag-filter-list-panel"></div>`
    );
    this.initialised = false;
    this.hasLoadedInitialState = false;
    this.isInitialState = false;
    this.filterGroupComps = [];
    // If a column drag is happening, we suppress handling the event until it has completed
    this.suppressOnColumnsChanged = false;
    this.onColumnsChangedPending = false;
  }
  wireBeans(beans) {
    this.toolPanelColDefService = beans.toolPanelColDefService;
    this.columnModel = beans.columnModel;
  }
  init(params) {
    this.initialised = true;
    const defaultParams = this.gos.addGridCommonParams({
      suppressExpandAll: false,
      suppressFilterSearch: false,
      suppressSyncLayoutWithGrid: false
    });
    _mergeDeep(defaultParams, params);
    this.params = defaultParams;
    if (!this.params.suppressSyncLayoutWithGrid) {
      this.addManagedEventListeners({ columnMoved: () => this.onColumnsChanged() });
    }
    this.addManagedEventListeners({
      newColumnsLoaded: () => this.onColumnsChanged(),
      toolPanelVisibleChanged: (event) => {
        if (event.key === "filters") {
          this.refreshFilters(event.visible);
        }
      },
      dragStarted: () => {
        this.suppressOnColumnsChanged = true;
      },
      dragStopped: () => {
        this.suppressOnColumnsChanged = false;
        if (this.onColumnsChangedPending) {
          this.onColumnsChangedPending = false;
          this.onColumnsChanged();
        }
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
    const columnTree = this.columnModel.getColDefColTree();
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
    if (_exists(this.searchFilterText)) {
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
    return _flatten(
      tree.map((child) => {
        if (isProvidedColumnGroup2(child)) {
          return _flatten(this.recursivelyAddFilterGroupComps(child, depth, expansionState));
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
        const filterGroupComp = this.createBean(
          new ToolPanelFilterGroupComp(column, [filterComp], this.onGroupExpanded.bind(this), depth, true)
        );
        filterGroupComp.addCssClassToTitleBar("ag-filter-toolpanel-header");
        if (!expansionState.get(filterGroupComp.getFilterGroupId())) {
          filterGroupComp.collapse();
        }
        return filterGroupComp;
      })
    );
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
    _setAriaLabel(this.getAriaElement(), `${filterListName} ${totalVisibleItems} ${localeFilters}`);
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
    const childFilterComps = _flatten(
      this.recursivelyAddComps(columnGroup.getChildren(), newDepth, expansionState)
    );
    if (columnGroup.isPadding()) {
      return childFilterComps;
    }
    const filterGroupComp = new ToolPanelFilterGroupComp(
      columnGroup,
      childFilterComps,
      this.onGroupExpanded.bind(this),
      depth,
      false
    );
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
      if (isProvidedColumnGroup2(child)) {
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
      const shouldExpandOrCollapse = !groupIds || _includes(groupIds, groupId);
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
        _warnOnce("unable to find groups for these supplied groupIds:", unrecognisedGroupIds);
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
      const updateFilterExpandState = !colIds || _includes(colIds, colId);
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
        _warnOnce("unable to find columns for these supplied colIds:" + unrecognisedColIds);
      }
    }
  }
  onGroupExpanded() {
    this.fireExpandedEvent();
  }
  onFilterExpanded() {
    this.dispatchLocalEvent({ type: "filterExpanded" });
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
    this.dispatchLocalEvent({ type: "groupExpanded", state });
  }
  performFilterSearch(searchText) {
    this.searchFilterText = _exists(searchText) ? searchText.toLowerCase() : null;
    this.searchFilters(this.searchFilterText);
  }
  searchFilters(searchFilter) {
    const passesFilter = (groupName) => {
      return !_exists(searchFilter) || groupName.toLowerCase().indexOf(searchFilter) !== -1;
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
    _clearElement3(this.getGui());
  }
  destroy() {
    this.destroyFilters();
    super.destroy();
  }
};
var AgFiltersToolPanelListSelector = {
  selector: "AG-FILTERS-TOOL-PANEL-LIST",
  component: AgFiltersToolPanelList
};

// enterprise-modules/filter-tool-panel/src/filterToolPanel/filtersToolPanel.ts
var FiltersToolPanel = class extends Component5 {
  constructor() {
    super(
      /* html */
      `<div class="ag-filter-toolpanel">
            <ag-filters-tool-panel-header data-ref="filtersToolPanelHeaderPanel"></ag-filters-tool-panel-header>
            <ag-filters-tool-panel-list data-ref="filtersToolPanelListPanel"></ag-filters-tool-panel-list>
         </div>`,
      [AgFiltersToolPanelHeaderSelector, AgFiltersToolPanelListSelector]
    );
    this.filtersToolPanelHeaderPanel = RefPlaceholder4;
    this.filtersToolPanelListPanel = RefPlaceholder4;
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
    this.params = {
      ...defaultParams,
      ...params
    };
    this.filtersToolPanelHeaderPanel.init(this.params);
    this.filtersToolPanelListPanel.init(this.params);
    const hideExpand = this.params.suppressExpandAll;
    const hideSearch = this.params.suppressFilterSearch;
    if (hideExpand && hideSearch) {
      this.filtersToolPanelHeaderPanel.setDisplayed(false);
    }
    this.listenerDestroyFuncs.push(
      ...this.addManagedListeners(this.filtersToolPanelHeaderPanel, {
        expandAll: this.onExpandAll.bind(this),
        collapseAll: this.onCollapseAll.bind(this),
        searchChanged: this.onSearchChanged.bind(this)
      }),
      ...this.addManagedListeners(this.filtersToolPanelListPanel, {
        filterExpanded: this.onFilterExpanded.bind(this),
        groupExpanded: this.onGroupExpanded.bind(this)
      })
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

// enterprise-modules/filter-tool-panel/src/version.ts
var VERSION = "32.0.0";

// enterprise-modules/filter-tool-panel/src/filtersToolPanelModule.ts
var FiltersToolPanelModule = {
  version: VERSION,
  moduleName: ModuleNames.FiltersToolPanelModule,
  beans: [],
  userComponents: [{ name: "agFiltersToolPanel", classImp: FiltersToolPanel }],
  dependantModules: [SideBarModule, EnterpriseCoreModule, _ColumnFilterModule]
};
export {
  FiltersToolPanelModule
};
//# sourceMappingURL=main.esm.mjs.map
