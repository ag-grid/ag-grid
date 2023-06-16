/**
          * @ag-grid-enterprise/filter-tool-panel - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.1
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
import { Autowired, RefSelector, PreConstruct, PostConstruct, Component, Events, _, KeyCode, Column, ProvidedColumnGroup, AgGroupComponent, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EXPAND_STATE;
(function (EXPAND_STATE) {
    EXPAND_STATE[EXPAND_STATE["EXPANDED"] = 0] = "EXPANDED";
    EXPAND_STATE[EXPAND_STATE["COLLAPSED"] = 1] = "COLLAPSED";
    EXPAND_STATE[EXPAND_STATE["INDETERMINATE"] = 2] = "INDETERMINATE";
})(EXPAND_STATE || (EXPAND_STATE = {}));
class FiltersToolPanelHeaderPanel extends Component {
    preConstruct() {
        this.setTemplate(/* html */ `<div class="ag-filter-toolpanel-search" role="presentation">
                <div ref="eExpand" class="ag-filter-toolpanel-expand"></div>
                <ag-input-text-field ref="eFilterTextField" class="ag-filter-toolpanel-search-input"></ag-input-text-field>
            </div>`);
    }
    postConstruct() {
        const translate = this.localeService.getLocaleTextFunc();
        this.eFilterTextField.onValueChange(this.onSearchTextChanged.bind(this));
        this.eFilterTextField.setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'));
        this.createExpandIcons();
        this.setExpandState(EXPAND_STATE.EXPANDED);
        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    }
    init(params) {
        this.params = params;
        if (this.columnModel.isReady()) {
            this.showOrHideOptions();
        }
    }
    createExpandIcons() {
        this.eExpand.appendChild(this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsService));
        this.eExpand.appendChild(this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsService));
        this.eExpand.appendChild(this.eExpandIndeterminate = _.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsService));
    }
    // we only show expand / collapse if we are showing filters
    showOrHideOptions() {
        const showFilterSearch = !this.params.suppressFilterSearch;
        const showExpand = !this.params.suppressExpandAll;
        const translate = this.localeService.getLocaleTextFunc();
        this.eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));
        const isFilterGroupPresent = (col) => col.getOriginalParent() && col.isFilterAllowed();
        const filterGroupsPresent = this.columnModel.getAllGridColumns().some(isFilterGroupPresent);
        _.setDisplayed(this.eFilterTextField.getGui(), showFilterSearch);
        _.setDisplayed(this.eExpand, showExpand && filterGroupsPresent);
    }
    onSearchTextChanged() {
        if (!this.onSearchTextChangedDebounced) {
            this.onSearchTextChangedDebounced = _.debounce(() => {
                this.dispatchEvent({ type: 'searchChanged', searchText: this.eFilterTextField.getValue() });
            }, 300);
        }
        this.onSearchTextChangedDebounced();
    }
    onExpandClicked() {
        const event = this.currentExpandState === EXPAND_STATE.EXPANDED ? { type: 'collapseAll' } : { type: 'expandAll' };
        this.dispatchEvent(event);
    }
    setExpandState(state) {
        this.currentExpandState = state;
        _.setDisplayed(this.eExpandChecked, this.currentExpandState === EXPAND_STATE.EXPANDED);
        _.setDisplayed(this.eExpandUnchecked, this.currentExpandState === EXPAND_STATE.COLLAPSED);
        _.setDisplayed(this.eExpandIndeterminate, this.currentExpandState === EXPAND_STATE.INDETERMINATE);
    }
}
__decorate$4([
    Autowired('columnModel')
], FiltersToolPanelHeaderPanel.prototype, "columnModel", void 0);
__decorate$4([
    RefSelector('eExpand')
], FiltersToolPanelHeaderPanel.prototype, "eExpand", void 0);
__decorate$4([
    RefSelector('eFilterTextField')
], FiltersToolPanelHeaderPanel.prototype, "eFilterTextField", void 0);
__decorate$4([
    PreConstruct
], FiltersToolPanelHeaderPanel.prototype, "preConstruct", null);
__decorate$4([
    PostConstruct
], FiltersToolPanelHeaderPanel.prototype, "postConstruct", null);

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ToolPanelFilterComp extends Component {
    constructor(hideHeader = false) {
        super(ToolPanelFilterComp.TEMPLATE);
        this.expanded = false;
        this.hideHeader = hideHeader;
    }
    postConstruct() {
        this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsService);
        this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsService);
        this.eExpand.appendChild(this.eExpandChecked);
        this.eExpand.appendChild(this.eExpandUnchecked);
    }
    setColumn(column) {
        this.column = column;
        this.eFilterName.innerText = this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false) || '';
        this.addManagedListener(this.eFilterToolPanelHeader, 'click', this.toggleExpanded.bind(this));
        this.addManagedListener(this.eFilterToolPanelHeader, 'keydown', (e) => {
            if (e.key === KeyCode.ENTER) {
                this.toggleExpanded();
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
        this.addInIcon('filter', this.eFilterIcon, this.column);
        _.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        _.setDisplayed(this.eExpandChecked, false);
        if (this.hideHeader) {
            _.setDisplayed(this.eFilterToolPanelHeader, false);
            this.eFilterToolPanelHeader.removeAttribute('tabindex');
        }
        else {
            this.eFilterToolPanelHeader.setAttribute('tabindex', '0');
        }
        this.addManagedListener(this.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_DESTROYED, this.onFilterDestroyed.bind(this));
    }
    getColumn() {
        return this.column;
    }
    getColumnFilterName() {
        return this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false);
    }
    addCssClassToTitleBar(cssClass) {
        this.eFilterToolPanelHeader.classList.add(cssClass);
    }
    addInIcon(iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        const eIcon = _.createIconNoSpan(iconName, this.gridOptionsService, column);
        eParent.appendChild(eIcon);
    }
    isFilterActive() {
        return this.filterManager.isFilterActive(this.column);
    }
    onFilterChanged() {
        _.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        this.dispatchEvent({ type: Column.EVENT_FILTER_CHANGED });
    }
    onFilterDestroyed(event) {
        if (this.expanded &&
            event.source === 'api' &&
            event.column.getId() === this.column.getId() &&
            this.columnModel.getPrimaryColumn(this.column)) {
            // filter was visible and has been destroyed by the API. If the column still exists, need to recreate UI component
            this.removeFilterElement();
            this.addFilterElement();
        }
    }
    toggleExpanded() {
        this.expanded ? this.collapse() : this.expand();
    }
    expand() {
        if (this.expanded) {
            return;
        }
        this.expanded = true;
        _.setAriaExpanded(this.eFilterToolPanelHeader, true);
        _.setDisplayed(this.eExpandChecked, true);
        _.setDisplayed(this.eExpandUnchecked, false);
        this.addFilterElement();
    }
    addFilterElement() {
        const filterPanelWrapper = _.loadTemplate(/* html */ `<div class="ag-filter-toolpanel-instance-filter"></div>`);
        const filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column, 'TOOLBAR');
        if (!filterWrapper) {
            return;
        }
        const { filterPromise, guiPromise } = filterWrapper;
        filterPromise === null || filterPromise === void 0 ? void 0 : filterPromise.then(filter => {
            this.underlyingFilter = filter;
            if (!filter) {
                return;
            }
            guiPromise.then(filterContainerEl => {
                if (filterContainerEl) {
                    filterPanelWrapper.appendChild(filterContainerEl);
                }
                this.agFilterToolPanelBody.appendChild(filterPanelWrapper);
                if (filter.afterGuiAttached) {
                    filter.afterGuiAttached({ container: 'toolPanel' });
                }
            });
        });
    }
    collapse() {
        var _a, _b;
        if (!this.expanded) {
            return;
        }
        this.expanded = false;
        _.setAriaExpanded(this.eFilterToolPanelHeader, false);
        this.removeFilterElement();
        _.setDisplayed(this.eExpandChecked, false);
        _.setDisplayed(this.eExpandUnchecked, true);
        (_b = (_a = this.underlyingFilter) === null || _a === void 0 ? void 0 : _a.afterGuiDetached) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    removeFilterElement() {
        _.clearElement(this.agFilterToolPanelBody);
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
            // set filters should be updated when the filter has been changed elsewhere, i.e. via api. Note that we can't
            // use 'afterGuiAttached' to refresh the virtual list as it also focuses on the mini filter which changes the
            // scroll position in the filter list panel
            if (typeof filter.refreshVirtualList === 'function') {
                filter.refreshVirtualList();
            }
        }
        else {
            (_a = filter.afterGuiDetached) === null || _a === void 0 ? void 0 : _a.call(filter);
        }
    }
    onFilterOpened(event) {
        if (event.source !== 'COLUMN_MENU') {
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
}
ToolPanelFilterComp.TEMPLATE = `
        <div class="ag-filter-toolpanel-instance">
            <div class="ag-filter-toolpanel-header ag-filter-toolpanel-instance-header" ref="eFilterToolPanelHeader" role="button" aria-expanded="false">
                <div ref="eExpand" class="ag-filter-toolpanel-expand"></div>
                <span ref="eFilterName" class="ag-header-cell-text"></span>
                <span ref="eFilterIcon" class="ag-header-icon ag-filter-icon ag-filter-toolpanel-instance-header-icon" aria-hidden="true"></span>
            </div>
            <div class="ag-filter-toolpanel-instance-body ag-filter" ref="agFilterToolPanelBody"></div>
        </div>`;
__decorate$3([
    RefSelector('eFilterToolPanelHeader')
], ToolPanelFilterComp.prototype, "eFilterToolPanelHeader", void 0);
__decorate$3([
    RefSelector('eFilterName')
], ToolPanelFilterComp.prototype, "eFilterName", void 0);
__decorate$3([
    RefSelector('agFilterToolPanelBody')
], ToolPanelFilterComp.prototype, "agFilterToolPanelBody", void 0);
__decorate$3([
    RefSelector('eFilterIcon')
], ToolPanelFilterComp.prototype, "eFilterIcon", void 0);
__decorate$3([
    RefSelector('eExpand')
], ToolPanelFilterComp.prototype, "eExpand", void 0);
__decorate$3([
    Autowired('filterManager')
], ToolPanelFilterComp.prototype, "filterManager", void 0);
__decorate$3([
    Autowired('columnModel')
], ToolPanelFilterComp.prototype, "columnModel", void 0);
__decorate$3([
    PostConstruct
], ToolPanelFilterComp.prototype, "postConstruct", null);

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ToolPanelFilterGroupComp extends Component {
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
            cssIdentifier: 'filter-toolpanel',
            direction: 'vertical'
        };
        this.setTemplate(ToolPanelFilterGroupComp.TEMPLATE, { filterGroupComp: groupParams });
    }
    init() {
        this.setGroupTitle();
        this.filterGroupComp.setAlignItems('stretch');
        this.filterGroupComp.addCssClass(`ag-filter-toolpanel-group-level-${this.depth}`);
        this.filterGroupComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth}-header`);
        this.childFilterComps.forEach(filterComp => {
            this.filterGroupComp.addItem(filterComp);
            filterComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth + 1}-header`);
        });
        this.refreshFilterClass();
        this.addExpandCollapseListeners();
        this.addFilterChangedListeners();
        this.setupTooltip();
    }
    setupTooltip() {
        // we don't show tooltips for groups, as when the group expands, it's div contains the columns which also
        // have tooltips, so the tooltips would clash. Eg mouse over group, tooltip shows, mouse over column, another
        // tooltip shows but cos we didn't leave the group the group tooltip remains. this should be fixed in the future,
        // maybe the group shouldn't contain the children form a DOM perspective.
        if (!this.showingColumn) {
            return;
        }
        const refresh = () => {
            const newTooltipText = this.columnGroup.getColDef().headerTooltip;
            this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'filterToolPanelColumnGroup';
        return res;
    }
    addCssClassToTitleBar(cssClass) {
        this.filterGroupComp.addCssClassToTitleBar(cssClass);
    }
    refreshFilters(isDisplayed) {
        this.childFilterComps.forEach(filterComp => {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                filterComp.refreshFilters(isDisplayed);
            }
            else {
                filterComp.refreshFilter(isDisplayed);
            }
        });
    }
    isColumnGroup() {
        return this.columnGroup instanceof ProvidedColumnGroup;
    }
    isExpanded() {
        return this.filterGroupComp.isExpanded();
    }
    getChildren() {
        return this.childFilterComps;
    }
    getFilterGroupName() {
        return this.filterGroupName ? this.filterGroupName : '';
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
    forEachToolPanelFilterChild(action) {
        this.childFilterComps.forEach(filterComp => {
            if (filterComp instanceof ToolPanelFilterComp) {
                action(filterComp);
            }
        });
    }
    addExpandCollapseListeners() {
        const expandListener = this.isColumnGroup() ?
            () => this.expandedCallback() :
            () => this.forEachToolPanelFilterChild(filterComp => filterComp.expand());
        const collapseListener = this.isColumnGroup() ?
            () => this.expandedCallback() :
            () => this.forEachToolPanelFilterChild(filterComp => filterComp.collapse());
        this.addManagedListener(this.filterGroupComp, AgGroupComponent.EVENT_EXPANDED, expandListener);
        this.addManagedListener(this.filterGroupComp, AgGroupComponent.EVENT_COLLAPSED, collapseListener);
    }
    getColumns() {
        if (this.columnGroup instanceof ProvidedColumnGroup) {
            return this.columnGroup.getLeafColumns();
        }
        return [this.columnGroup];
    }
    addFilterChangedListeners() {
        this.getColumns().forEach(column => {
            this.addManagedListener(column, Column.EVENT_FILTER_CHANGED, () => this.refreshFilterClass());
        });
        if (!(this.columnGroup instanceof ProvidedColumnGroup)) {
            this.addManagedListener(this.eventService, Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
        }
    }
    refreshFilterClass() {
        const columns = this.getColumns();
        const anyChildFiltersActive = () => columns.some(col => col.isFilterActive());
        this.filterGroupComp.addOrRemoveCssClass('ag-has-filter', anyChildFiltersActive());
    }
    onFilterOpened(event) {
        // when a filter is opened elsewhere, i.e. column menu we close the filter comp so we also need to collapse
        // the column group. This approach means we don't need to try and sync filter models on the same column.
        if (event.source !== 'COLUMN_MENU') {
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
        this.filterGroupName = (this.columnGroup instanceof ProvidedColumnGroup) ?
            this.getColumnGroupName(this.columnGroup) : this.getColumnName(this.columnGroup);
        this.filterGroupComp.setTitle(this.filterGroupName || '');
    }
    getColumnGroupName(columnGroup) {
        return this.columnModel.getDisplayNameForProvidedColumnGroup(null, columnGroup, 'filterToolPanel');
    }
    getColumnName(column) {
        return this.columnModel.getDisplayNameForColumn(column, 'filterToolPanel', false);
    }
    destroyFilters() {
        this.childFilterComps = this.destroyBeans(this.childFilterComps);
        _.clearElement(this.getGui());
    }
    destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
ToolPanelFilterGroupComp.TEMPLATE = `<div class="ag-filter-toolpanel-group-wrapper">
            <ag-group-component ref="filterGroupComp"></ag-group-component>
        </div>`;
__decorate$2([
    RefSelector('filterGroupComp')
], ToolPanelFilterGroupComp.prototype, "filterGroupComp", void 0);
__decorate$2([
    Autowired('columnModel')
], ToolPanelFilterGroupComp.prototype, "columnModel", void 0);
__decorate$2([
    PreConstruct
], ToolPanelFilterGroupComp.prototype, "preConstruct", null);
__decorate$2([
    PostConstruct
], ToolPanelFilterGroupComp.prototype, "init", null);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class FiltersToolPanelListPanel extends Component {
    constructor() {
        super(FiltersToolPanelListPanel.TEMPLATE);
        this.initialised = false;
        this.filterGroupComps = [];
    }
    init(params) {
        this.initialised = true;
        const defaultParams = {
            suppressExpandAll: false,
            suppressFilterSearch: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;
        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, () => this.onColumnsChanged());
        }
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.onColumnsChanged());
        this.addManagedListener(this.eventService, Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED, (event) => {
            // when re-entering the filters tool panel we need to refresh the virtual lists in the set filters in case
            // filters have been changed elsewhere, i.e. via an api call.
            if (event.key === 'filters') {
                this.refreshFilters(event.visible);
            }
        });
        if (this.columnModel.isReady()) {
            this.onColumnsChanged();
        }
    }
    onColumnsChanged() {
        const pivotModeActive = this.columnModel.isPivotMode();
        const shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        shouldSyncColumnLayoutWithGrid ? this.syncFilterLayout() : this.buildTreeFromProvidedColumnDefs();
    }
    syncFilterLayout() {
        this.toolPanelColDefService.syncLayoutWithGrid(this.setFiltersLayout.bind(this));
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
        // Underlying filter comp/element won't get recreated if the column still exists (the element just gets detached/re-attached).
        // We can therefore restore focus if an element in the filter tool panel was focused.
        const activeElement = this.gridOptionsService.getDocument().activeElement;
        // Want to restore the expansion state where possible.
        const expansionState = this.getExpansionState();
        this.destroyFilters();
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0, expansionState);
        const len = this.filterGroupComps.length;
        if (len) {
            // skip the destroy function because this will be managed
            // by the `destroyFilters` function
            this.filterGroupComps.forEach(comp => this.appendChild(comp));
            this.setFirstAndLastVisible(0, len - 1);
        }
        // perform search if searchFilterText exists
        if (_.exists(this.searchFilterText)) {
            this.searchFilters(this.searchFilterText);
        }
        // notify header of expand
        this.fireExpandedEvent();
        // We only care about restoring focus if the originally focused element was in the filter tool panel.
        if (this.getGui().contains(activeElement)) {
            activeElement.focus();
        }
    }
    recursivelyAddComps(tree, depth, expansionState) {
        return _.flatten(tree.map(child => {
            if (child instanceof ProvidedColumnGroup) {
                return _.flatten(this.recursivelyAddFilterGroupComps(child, depth, expansionState));
            }
            const column = child;
            if (!this.shouldDisplayFilter(column)) {
                return [];
            }
            const hideFilterCompHeader = depth === 0;
            const filterComp = new ToolPanelFilterComp(hideFilterCompHeader);
            this.createBean(filterComp);
            filterComp.setColumn(column);
            if (expansionState.get(column.getId())) {
                // Default state on creation and desired state are both collapsed. Expand if expanded before.
                filterComp.expand();
            }
            if (depth > 0) {
                return filterComp;
            }
            const filterGroupComp = this.createBean(new ToolPanelFilterGroupComp(column, [filterComp], this.onGroupExpanded.bind(this), depth, true));
            filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
            if (!expansionState.get(filterGroupComp.getFilterGroupId())) {
                // Default state on creation is expanded. Desired initial state is collapsed. Always collapse unless expanded before.
                filterGroupComp.collapse();
            }
            return filterGroupComp;
        }));
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
        const childFilterComps = _.flatten(this.recursivelyAddComps(columnGroup.getChildren(), newDepth, expansionState));
        if (columnGroup.isPadding()) {
            return childFilterComps;
        }
        const filterGroupComp = new ToolPanelFilterGroupComp(columnGroup, childFilterComps, this.onGroupExpanded.bind(this), depth, false);
        this.createBean(filterGroupComp);
        filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
        if (expansionState.get(filterGroupComp.getFilterGroupId()) === false) {
            // Default state on creation is expanded. Desired initial state is expanded. Only collapse if collapsed before.
            filterGroupComp.collapse();
        }
        return [filterGroupComp];
    }
    filtersExistInChildren(tree) {
        return tree.some(child => {
            if (child instanceof ProvidedColumnGroup) {
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
        const expansionState = new Map();
        const recursiveGetExpansionState = (filterGroupComp) => {
            expansionState.set(filterGroupComp.getFilterGroupId(), filterGroupComp.isExpanded());
            filterGroupComp.getChildren().forEach(child => {
                if (child instanceof ToolPanelFilterGroupComp) {
                    recursiveGetExpansionState(child);
                }
                else {
                    expansionState.set(child.getColumn().getId(), child.isExpanded());
                }
            });
        };
        this.filterGroupComps.forEach(recursiveGetExpansionState);
        return expansionState;
    }
    // we don't support refreshing, but must implement because it's on the tool panel interface
    refresh() { }
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
            const shouldExpandOrCollapse = !groupIds || _.includes(groupIds, groupId);
            if (shouldExpandOrCollapse) {
                // don't expand 'column groups', i.e. top level columns wrapped in a group
                if (expand && filterGroup.isColumnGroup()) {
                    filterGroup.expand();
                }
                else {
                    filterGroup.collapse();
                }
                updatedGroupIds.push(groupId);
            }
            // recursively look for more groups to expand / collapse
            filterGroup.getChildren().forEach(child => {
                if (child instanceof ToolPanelFilterGroupComp) {
                    updateGroupExpandState(child);
                }
            });
        };
        this.filterGroupComps.forEach(updateGroupExpandState);
        // update header expand / collapse icon
        this.onGroupExpanded();
        if (groupIds) {
            const unrecognisedGroupIds = groupIds.filter(groupId => updatedGroupIds.indexOf(groupId) < 0);
            if (unrecognisedGroupIds.length > 0) {
                console.warn('AG Grid: unable to find groups for these supplied groupIds:', unrecognisedGroupIds);
            }
        }
    }
    expandFilters(expand, colIds) {
        const updatedColIds = [];
        const updateGroupExpandState = (filterComp) => {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                let anyChildrenChanged = false;
                filterComp.getChildren().forEach(child => {
                    const childUpdated = updateGroupExpandState(child);
                    if (childUpdated) {
                        if (expand) {
                            filterComp.expand();
                            anyChildrenChanged = true;
                        }
                        else if (!filterComp.isColumnGroup()) {
                            // we only collapse columns wrapped in groups
                            filterComp.collapse();
                        }
                    }
                });
                return anyChildrenChanged;
            }
            const colId = filterComp.getColumn().getColId();
            const updateFilterExpandState = !colIds || _.includes(colIds, colId);
            if (updateFilterExpandState) {
                expand ? filterComp.expand() : filterComp.collapse();
                updatedColIds.push(colId);
            }
            return updateFilterExpandState;
        };
        this.filterGroupComps.forEach(updateGroupExpandState);
        // update header expand / collapse icon
        this.onGroupExpanded();
        if (colIds) {
            const unrecognisedColIds = colIds.filter(colId => updatedColIds.indexOf(colId) < 0);
            if (unrecognisedColIds.length > 0) {
                console.warn('AG Grid: unable to find columns for these supplied colIds:', unrecognisedColIds);
            }
        }
    }
    onGroupExpanded() {
        this.fireExpandedEvent();
    }
    fireExpandedEvent() {
        let expandedCount = 0;
        let notExpandedCount = 0;
        const updateExpandCounts = (filterGroup) => {
            if (!filterGroup.isColumnGroup()) {
                return;
            }
            filterGroup.isExpanded() ? expandedCount++ : notExpandedCount++;
            filterGroup.getChildren().forEach(child => {
                if (child instanceof ToolPanelFilterGroupComp) {
                    updateExpandCounts(child);
                }
            });
        };
        this.filterGroupComps.forEach(updateExpandCounts);
        let state;
        if (expandedCount > 0 && notExpandedCount > 0) {
            state = EXPAND_STATE.INDETERMINATE;
        }
        else if (notExpandedCount > 0) {
            state = EXPAND_STATE.COLLAPSED;
        }
        else {
            state = EXPAND_STATE.EXPANDED;
        }
        this.dispatchEvent({ type: 'groupExpanded', state: state });
    }
    performFilterSearch(searchText) {
        this.searchFilterText = _.exists(searchText) ? searchText.toLowerCase() : null;
        this.searchFilters(this.searchFilterText);
    }
    searchFilters(searchFilter) {
        const passesFilter = (groupName) => {
            return !_.exists(searchFilter) || groupName.toLowerCase().indexOf(searchFilter) !== -1;
        };
        const recursivelySearch = (filterItem, parentPasses) => {
            if (!(filterItem instanceof ToolPanelFilterGroupComp)) {
                return passesFilter(filterItem.getColumnFilterName() || '');
            }
            const children = filterItem.getChildren();
            const groupNamePasses = passesFilter(filterItem.getFilterGroupName());
            // if group or parent already passed - ensure this group and all children are visible
            const alreadyPassed = parentPasses || groupNamePasses;
            if (alreadyPassed) {
                // ensure group visible
                filterItem.hideGroup(false);
                // ensure all children are visible
                for (let i = 0; i < children.length; i++) {
                    recursivelySearch(children[i], alreadyPassed);
                    filterItem.hideGroupItem(false, i);
                }
                return true;
            }
            // hide group item filters
            let anyChildPasses = false;
            children.forEach((child, index) => {
                const childPasses = recursivelySearch(child, parentPasses);
                filterItem.hideGroupItem(!childPasses, index);
                if (childPasses) {
                    anyChildPasses = true;
                }
            });
            // hide group if no children pass
            filterItem.hideGroup(!anyChildPasses);
            return anyChildPasses;
        };
        let firstVisible;
        let lastVisible;
        this.filterGroupComps.forEach((filterGroup, idx) => {
            recursivelySearch(filterGroup, false);
            if (firstVisible === undefined) {
                if (!filterGroup.containsCssClass('ag-hidden')) {
                    firstVisible = idx;
                    lastVisible = idx;
                }
            }
            else if (!filterGroup.containsCssClass('ag-hidden') && lastVisible !== idx) {
                lastVisible = idx;
            }
        });
        this.setFirstAndLastVisible(firstVisible, lastVisible);
    }
    setFirstAndLastVisible(firstIdx, lastIdx) {
        this.filterGroupComps.forEach((filterGroup, idx) => {
            filterGroup.removeCssClass('ag-first-group-visible');
            filterGroup.removeCssClass('ag-last-group-visible');
            if (idx === firstIdx) {
                filterGroup.addCssClass('ag-first-group-visible');
            }
            if (idx === lastIdx) {
                filterGroup.addCssClass('ag-last-group-visible');
            }
        });
    }
    refreshFilters(isDisplayed) {
        this.filterGroupComps.forEach(filterGroupComp => filterGroupComp.refreshFilters(isDisplayed));
    }
    destroyFilters() {
        this.filterGroupComps = this.destroyBeans(this.filterGroupComps);
        _.clearElement(this.getGui());
    }
    destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
FiltersToolPanelListPanel.TEMPLATE = `<div class="ag-filter-list-panel"></div>`;
__decorate$1([
    Autowired("gridApi")
], FiltersToolPanelListPanel.prototype, "gridApi", void 0);
__decorate$1([
    Autowired("columnApi")
], FiltersToolPanelListPanel.prototype, "columnApi", void 0);
__decorate$1([
    Autowired('toolPanelColDefService')
], FiltersToolPanelListPanel.prototype, "toolPanelColDefService", void 0);
__decorate$1([
    Autowired('columnModel')
], FiltersToolPanelListPanel.prototype, "columnModel", void 0);

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class FiltersToolPanel extends Component {
    constructor() {
        super(FiltersToolPanel.TEMPLATE);
        this.initialised = false;
        this.listenerDestroyFuncs = [];
    }
    init(params) {
        // if initialised is true, means this is a refresh
        if (this.initialised) {
            this.listenerDestroyFuncs.forEach(func => func());
            this.listenerDestroyFuncs = [];
        }
        this.initialised = true;
        const defaultParams = {
            suppressExpandAll: false,
            suppressFilterSearch: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi,
        };
        this.params = Object.assign(Object.assign(Object.assign({}, defaultParams), params), { context: this.gridOptionsService.context });
        this.filtersToolPanelHeaderPanel.init(this.params);
        this.filtersToolPanelListPanel.init(this.params);
        const hideExpand = this.params.suppressExpandAll;
        const hideSearch = this.params.suppressFilterSearch;
        if (hideExpand && hideSearch) {
            this.filtersToolPanelHeaderPanel.setDisplayed(false);
        }
        // this is necessary to prevent a memory leak while refreshing the tool panel
        this.listenerDestroyFuncs.push(this.addManagedListener(this.filtersToolPanelHeaderPanel, 'expandAll', this.onExpandAll.bind(this)), this.addManagedListener(this.filtersToolPanelHeaderPanel, 'collapseAll', this.onCollapseAll.bind(this)), this.addManagedListener(this.filtersToolPanelHeaderPanel, 'searchChanged', this.onSearchChanged.bind(this)), this.addManagedListener(this.filtersToolPanelListPanel, 'groupExpanded', this.onGroupExpanded.bind(this)));
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
    onGroupExpanded(event) {
        this.filtersToolPanelHeaderPanel.setExpandState(event.state);
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
    refresh() {
        this.init(this.params);
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
}
FiltersToolPanel.TEMPLATE = `<div class="ag-filter-toolpanel">
            <ag-filters-tool-panel-header ref="filtersToolPanelHeaderPanel"></ag-filters-tool-panel-header>
            <ag-filters-tool-panel-list ref="filtersToolPanelListPanel"></ag-filters-tool-panel-list>
         </div>`;
__decorate([
    RefSelector('filtersToolPanelHeaderPanel')
], FiltersToolPanel.prototype, "filtersToolPanelHeaderPanel", void 0);
__decorate([
    RefSelector('filtersToolPanelListPanel')
], FiltersToolPanel.prototype, "filtersToolPanelListPanel", void 0);
__decorate([
    Autowired('gridApi')
], FiltersToolPanel.prototype, "gridApi", void 0);
__decorate([
    Autowired('columnApi')
], FiltersToolPanel.prototype, "columnApi", void 0);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.1';

const FiltersToolPanelModule = {
    version: VERSION,
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    agStackComponents: [
        { componentName: 'AgFiltersToolPanelHeader', componentClass: FiltersToolPanelHeaderPanel },
        { componentName: 'AgFiltersToolPanelList', componentClass: FiltersToolPanelListPanel }
    ],
    userComponents: [
        { componentName: 'agFiltersToolPanel', componentClass: FiltersToolPanel },
    ],
    dependantModules: [
        SideBarModule,
        EnterpriseCoreModule
    ]
};

export { FiltersToolPanelModule };
