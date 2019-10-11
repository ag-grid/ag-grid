import {
    _,
    AbstractColDef,
    Autowired,
    Column,
    ColumnController,
    Component,
    Events,
    EventService,
    GridApi,
    OriginalColumnGroup,
    OriginalColumnGroupChild,
    ModuleLogger
} from "ag-grid-community";

import {ToolPanelFilterComp} from "./toolPanelFilterComp";
import {ToolPanelFiltersCompParams} from "./filtersToolPanel";
import {ToolPanelFilterGroupComp, ToolPanelFilterItem} from "./toolPanelFilterGroupComp";
import {EXPAND_STATE} from "./filtersToolPanelHeaderPanel";
import {ToolPanelColDefService} from "../../common/toolPanelColDefService";

ModuleLogger.logModuleClass('FiltersTP.FiltersToolPanelListPanel');

export class FiltersToolPanelListPanel extends Component {

    private static TEMPLATE = `<div class="ag-filter-list-panel"></div>`;

    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("eventService") private eventService: EventService;
    @Autowired('toolPanelColDefService') private toolPanelColDefService: ToolPanelColDefService;
    @Autowired('columnController') private columnController: ColumnController;

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
            api: this.gridApi
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;

        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, () => this.syncFilterLayout());
        }

        this.addDestroyableEventListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.onColumnsChanged());

        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    public onColumnsChanged(): void {
        this.destroyFilters();
        const columnTree: OriginalColumnGroupChild[] = this.columnController.getPrimaryColumnTree();
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0);
        this.filterGroupComps.forEach(comp => this.appendChild(comp));

        // perform search if searchFilterText exists
        if (_.exists(this.searchFilterText)) {
            this.searchFilters(this.searchFilterText);
        }

        // notify header of expand
        this.fireExpandedEvent();
    }

    public syncFilterLayout(): void {
        this.toolPanelColDefService.syncLayoutWithGrid(this.setFiltersLayout.bind(this));
    }

    public setFiltersLayout(colDefs: AbstractColDef[]): void {
        this.destroyFilters();
        const columnTree: OriginalColumnGroupChild[] = this.toolPanelColDefService.createColumnTree(colDefs);
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0);
        this.filterGroupComps.forEach(comp => this.appendChild(comp));

        // perform search if searchFilterText exists
        if (_.exists(this.searchFilterText)) {
            this.searchFilters(this.searchFilterText);
        }

        // notify header of expand
        this.fireExpandedEvent();
    }

    private recursivelyAddComps(tree: OriginalColumnGroupChild[], depth: number): ToolPanelFilterGroupComp[] {
        return _.flatten(tree.map(child => {
            if (child instanceof OriginalColumnGroup) {
                return _.flatten(this.recursivelyAddFilterGroupComps(child as OriginalColumnGroup, depth));
            } else {
                const column = child as Column;
                if (column.getColDef() && column.getColDef().suppressFiltersToolPanel) {
                    return [];
                }

                const hideFilterCompHeader = depth === 0;
                const filterComp = new ToolPanelFilterComp(hideFilterCompHeader);
                this.getContext().wireBean(filterComp);
                filterComp.setColumn(column);

                if (depth > 0) {
                    return filterComp;
                } else {
                    const filterGroupComp =
                        new ToolPanelFilterGroupComp(column, [filterComp], this.onGroupExpanded.bind(this), depth);

                    this.getContext().wireBean(filterGroupComp);
                    filterGroupComp.collapse();
                    return filterGroupComp;
                }
            }
        }));
    }

    private recursivelyAddFilterGroupComps(columnGroup: OriginalColumnGroup, depth: number): ToolPanelFilterGroupComp[] {
        if (columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressFiltersToolPanel) {
            return [];
        }

        const newDepth = columnGroup.isPadding() ? depth : depth + 1;
        const childFilterComps = _.flatten(this.recursivelyAddComps(columnGroup.getChildren(), newDepth));

        if (columnGroup.isPadding()) return childFilterComps;

        const filterGroupComp =
            new ToolPanelFilterGroupComp(columnGroup, childFilterComps, this.onGroupExpanded.bind(this), depth);

        this.getContext().wireBean(filterGroupComp);

        return [filterGroupComp];
    }

    // we don't support refreshing, but must implement because it's on the tool panel interface
    public refresh(): void {}

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
                console.warn('ag-Grid: unable to find groups for these supplied groupIds:', unrecognisedGroupIds);
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
            } else {
                const colId = filterComp.getColumn().getColId();
                const updateFilterExpandState = !colIds || _.includes(colIds, colId);
                if (updateFilterExpandState) {
                    expand ? filterComp.expand() : filterComp.collapse();
                    updatedColIds.push(colId);
                }
                return updateFilterExpandState;
            }
        };

        this.filterGroupComps.forEach(updateGroupExpandState);

        // update header expand / collapse icon
        this.onGroupExpanded();

        if (colIds) {
            const unrecognisedColIds = colIds.filter(colId => updatedColIds.indexOf(colId) < 0);
            if (unrecognisedColIds.length > 0) {
                console.warn('ag-Grid: unable to find columns for these supplied colIds:', unrecognisedColIds);
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
            if (!filterGroup.isColumnGroup()) return;

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

       this.dispatchEvent({type: 'groupExpanded', state: state});
    }

    public performFilterSearch(searchText: string) {
        this.searchFilterText = searchText;
        this.searchFilters(searchText);
    }

    private searchFilters(searchFilter: string | null) {
        const passesFilter = (groupName: string) => {
            return !_.exists(searchFilter) || groupName.toLowerCase().includes(searchFilter as string);
        };

        const recursivelySearch = (filterItem: ToolPanelFilterItem, parentPasses: boolean): boolean => {
            if (filterItem instanceof ToolPanelFilterGroupComp) {
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
                    if (childPasses) anyChildPasses = true;
                });

                // hide group if no children pass
                filterItem.hideGroup(!anyChildPasses);

                return anyChildPasses;
            } else {
                return passesFilter(filterItem.getColumnFilterName());
            }
        };

        this.filterGroupComps.forEach(filterGroup => recursivelySearch(filterGroup, false));
    }

    private destroyFilters() {
        this.filterGroupComps.forEach(filterComp => filterComp.destroy());
        this.filterGroupComps.length = 0;
        _.clearElement(this.getGui());
    }

    public destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
