import {
    _,
    AbstractColDef,
    Autowired,
    Column,
    ColumnApi,
    ColumnModel,
    Component,
    Events,
    GridApi,
    ProvidedColumnGroup,
    IProvidedColumn
} from "@ag-grid-community/core";

import { ToolPanelFilterComp } from "./toolPanelFilterComp";
import { ToolPanelFiltersCompParams } from "./filtersToolPanel";
import { ToolPanelFilterGroupComp, ToolPanelFilterItem } from "./toolPanelFilterGroupComp";
import { EXPAND_STATE } from "./filtersToolPanelHeaderPanel";
import { ToolPanelColDefService } from "@ag-grid-enterprise/side-bar";

export class FiltersToolPanelListPanel extends Component {

    private static TEMPLATE = /* html */ `<div class="ag-filter-list-panel"></div>`;

    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("columnApi") private columnApi: ColumnApi;
    @Autowired('toolPanelColDefService') private toolPanelColDefService: ToolPanelColDefService;
    @Autowired('columnModel') private columnModel: ColumnModel;

    private initialised = false;

    private params: ToolPanelFiltersCompParams;
    private filterGroupComps: ToolPanelFilterGroupComp[] = [];

    // null is used to check if we should search filters when new cols are loaded
    private searchFilterText: string | null;

    constructor() {
        super(FiltersToolPanelListPanel.TEMPLATE);
    }

    public init(params: ToolPanelFiltersCompParams): void {
        this.initialised = true;

        const defaultParams: ToolPanelFiltersCompParams = {
            suppressExpandAll: false,
            suppressFilterSearch: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.get('context')
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;

        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, () => this.onColumnsChanged());
        }

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.onColumnsChanged());

        this.addManagedListener(this.eventService, Events.EVENT_INTERNAL_TOOL_PANEL_VISIBLE_CHANGED, (event) => {
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

    public onColumnsChanged(): void {
        const pivotModeActive = this.columnModel.isPivotMode();
        const shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        shouldSyncColumnLayoutWithGrid ? this.syncFilterLayout() : this.buildTreeFromProvidedColumnDefs();
    }

    public syncFilterLayout(): void {
        this.toolPanelColDefService.syncLayoutWithGrid(this.setFiltersLayout.bind(this));
    }

    private buildTreeFromProvidedColumnDefs(): void {
        this.destroyFilters();
        const columnTree: IProvidedColumn[] = this.columnModel.getPrimaryColumnTree();
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0);
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
    }

    public setFiltersLayout(colDefs: AbstractColDef[]): void {
        this.destroyFilters();
        const columnTree: IProvidedColumn[] = this.toolPanelColDefService.createColumnTree(colDefs);
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0);

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
    }

    private recursivelyAddComps(tree: IProvidedColumn[], depth: number): ToolPanelFilterGroupComp[] {
        return _.flatten(tree.map(child => {
            if (child instanceof ProvidedColumnGroup) {
                return _.flatten(this.recursivelyAddFilterGroupComps(child, depth)!);
            }

            const column = child as Column;

            if (!this.shouldDisplayFilter(column)) { return []; }

            const hideFilterCompHeader = depth === 0;
            const filterComp = new ToolPanelFilterComp(hideFilterCompHeader);
            this.createBean(filterComp);

            filterComp.setColumn(column);

            if (depth > 0) { return filterComp; }

            const filterGroupComp = this.createBean(new ToolPanelFilterGroupComp(column, [filterComp], this.onGroupExpanded.bind(this), depth, true));
            filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
            filterGroupComp.collapse();
            return filterGroupComp;
        }));
    }

    private recursivelyAddFilterGroupComps(columnGroup: ProvidedColumnGroup, depth: number): ToolPanelFilterGroupComp[] | undefined {
        if (!this.filtersExistInChildren(columnGroup.getChildren())) { return; }

        const colGroupDef = columnGroup.getColGroupDef();
        if (colGroupDef && colGroupDef.suppressFiltersToolPanel) { return []; }

        const newDepth = columnGroup.isPadding() ? depth : depth + 1;
        const childFilterComps = _.flatten(this.recursivelyAddComps(columnGroup.getChildren(), newDepth));

        if (columnGroup.isPadding()) { return childFilterComps; }

        const filterGroupComp =
            new ToolPanelFilterGroupComp(columnGroup, childFilterComps, this.onGroupExpanded.bind(this), depth, false);

        this.createBean(filterGroupComp);
        filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
        return [filterGroupComp];
    }

    private filtersExistInChildren(tree: IProvidedColumn[]): boolean {
        return tree.some(child => {
            if (child instanceof ProvidedColumnGroup) {
                return this.filtersExistInChildren(child.getChildren());
            }

            return this.shouldDisplayFilter(child as Column);
        });
    }

    private shouldDisplayFilter(column: Column) {
        const suppressFiltersToolPanel = column.getColDef() && column.getColDef().suppressFiltersToolPanel;
        return column.isFilterAllowed() && !suppressFiltersToolPanel;
    }

    // we don't support refreshing, but must implement because it's on the tool panel interface
    public refresh(): void { }

    // lazy initialise the panel
    public setVisible(visible: boolean): void {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    }

    public expandFilterGroups(expand: boolean, groupIds?: string[]): void {
        const updatedGroupIds: string[] = [];

        const updateGroupExpandState = (filterGroup: ToolPanelFilterGroupComp) => {
            const groupId = filterGroup.getFilterGroupId();
            const shouldExpandOrCollapse = !groupIds || _.includes(groupIds, groupId);
            if (shouldExpandOrCollapse) {
                // don't expand 'column groups', i.e. top level columns wrapped in a group
                if (expand && filterGroup.isColumnGroup()) {
                    filterGroup.expand();
                } else {
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

    public expandFilters(expand: boolean, colIds?: string[]): void {
        const updatedColIds: string[] = [];

        const updateGroupExpandState = (filterComp: ToolPanelFilterGroupComp | ToolPanelFilterComp): boolean => {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                let anyChildrenChanged = false;
                filterComp.getChildren().forEach(child => {
                    const childUpdated = updateGroupExpandState(child);
                    if (childUpdated) {
                        if (expand) {
                            filterComp.expand();
                            anyChildrenChanged = true;
                        } else if (!filterComp.isColumnGroup()) {
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

    private onGroupExpanded(): void {
        this.fireExpandedEvent();
    }

    private fireExpandedEvent(): void {
        let expandedCount = 0;
        let notExpandedCount = 0;

        const updateExpandCounts = (filterGroup: ToolPanelFilterGroupComp) => {
            if (!filterGroup.isColumnGroup()) { return; }

            filterGroup.isExpanded() ? expandedCount++ : notExpandedCount++;

            filterGroup.getChildren().forEach(child => {
                if (child instanceof ToolPanelFilterGroupComp) {
                    updateExpandCounts(child);
                }
            });
        };

        this.filterGroupComps.forEach(updateExpandCounts);

        let state: EXPAND_STATE;
        if (expandedCount > 0 && notExpandedCount > 0) {
            state = EXPAND_STATE.INDETERMINATE;
        } else if (notExpandedCount > 0) {
            state = EXPAND_STATE.COLLAPSED;
        } else {
            state = EXPAND_STATE.EXPANDED;
        }

        this.dispatchEvent({ type: 'groupExpanded', state: state });
    }

    public performFilterSearch(searchText: string) {
        this.searchFilterText = _.exists(searchText) ? searchText.toLowerCase() : null;
        this.searchFilters(this.searchFilterText);
    }

    private searchFilters(searchFilter: string | null) {
        const passesFilter = (groupName: string) => {
            return !_.exists(searchFilter) || groupName.toLowerCase().indexOf(searchFilter) !== -1;
        };

        const recursivelySearch = (filterItem: ToolPanelFilterItem, parentPasses: boolean): boolean => {
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
            children.forEach((child: ToolPanelFilterItem, index: number) => {
                const childPasses = recursivelySearch(child, parentPasses);
                filterItem.hideGroupItem(!childPasses, index);
                if (childPasses) { anyChildPasses = true; }
            });

            // hide group if no children pass
            filterItem.hideGroup(!anyChildPasses);

            return anyChildPasses;
        };

        let firstVisible: number | undefined;
        let lastVisible: number | undefined;

        this.filterGroupComps.forEach((filterGroup, idx) => {
            recursivelySearch(filterGroup, false);

            if (firstVisible === undefined) {
                if (!filterGroup.containsCssClass('ag-hidden')) {
                    firstVisible = idx;
                    lastVisible = idx;
                }
            } else if (!filterGroup.containsCssClass('ag-hidden') && lastVisible !== idx) {
                lastVisible = idx;
            }
        });

        this.setFirstAndLastVisible(firstVisible, lastVisible);
    }

    private setFirstAndLastVisible(firstIdx?: number, lastIdx?: number) {
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

    private refreshFilters(isDisplayed: boolean) {
        this.filterGroupComps.forEach(filterGroupComp => filterGroupComp.refreshFilters(isDisplayed));
    }

    private destroyFilters() {
        this.filterGroupComps = this.destroyBeans(this.filterGroupComps);
        _.clearElement(this.getGui());
    }

    protected destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
