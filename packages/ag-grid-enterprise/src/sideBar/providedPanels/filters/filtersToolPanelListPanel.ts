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
} from "ag-grid-community";

import {ToolPanelFilterComp} from "./toolPanelFilterComp";
import {ToolPanelFiltersCompParams} from "./filtersToolPanel";
import {ToolPanelFilterGroupComp, ToolPanelFilterItem} from "./toolPanelFilterGroupComp";
import {EXPAND_STATE} from "./filtersToolPanelHeaderPanel";
import {ToolPanelColDefService} from "../toolPanelColDefService";

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
            suppressFilter: false,
            syncLayoutWithGrid: true,
            api: this.gridApi
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;

        if (this.params.syncLayoutWithGrid) {
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
    }

    private recursivelyAddComps(tree: OriginalColumnGroupChild[], depth: number): ToolPanelFilterGroupComp[] {
        return _.flatten(tree.map(child => {
            if (child instanceof OriginalColumnGroup) {
                return _.flatten(this.recursivelyAddFilterGroupComps(child as OriginalColumnGroup, depth));
            } else {
                const hideFilterCompHeader = depth === 0;
                const filterComp = new ToolPanelFilterComp(hideFilterCompHeader);
                this.getContext().wireBean(filterComp);
                filterComp.setColumn(child as Column);

                if (depth > 0) {
                    return filterComp;
                } else {
                    const filterGroupComp =
                        new ToolPanelFilterGroupComp(child, [filterComp], this.onGroupExpanded.bind(this), depth);

                    this.getContext().wireBean(filterGroupComp);
                    filterGroupComp.collapse();
                    return filterGroupComp;
                }
            }
        }));
    }

    private recursivelyAddFilterGroupComps(columnGroup: OriginalColumnGroup, depth: number): ToolPanelFilterGroupComp[] {
        // if (columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressToolPanel) //TODO

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

    public expandFilterGroups(expand: boolean): void {
        const expandAllGroups = (filterGroup: ToolPanelFilterGroupComp) => {
            if (expand && filterGroup.isColumnGroup()) {
                filterGroup.expand();
            } else {
                filterGroup.collapse();
            }

            filterGroup.getChildren().forEach(child => {
                if (child instanceof ToolPanelFilterGroupComp) {
                    expandAllGroups(child);
                }
            });
        };

        this.filterGroupComps.forEach(expandAllGroups);
        this.onGroupExpanded();
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

    public expandFilters(colIds?: string[]): void {
        this.executeOnFilterComps(filterComp => filterComp.doExpand(), colIds);
    }

    public collapseFilters(colIds?: string[]): void {
        this.executeOnFilterComps(filterComp => filterComp.doCollapse(), colIds);
    }

    private executeOnFilterComps(callbackFunc: (filterComp: ToolPanelFilterComp) => void, colIds?: string[]): void {
        //TODO
        // const executedColIds: string[] = [];
        //
        // // done in reverse order to ensure top scroll position
        // for (let i = this.filterComps.length - 1; i >= 0; i--) {
        //     const filterComp = this.filterComps[i] as ToolPanelFilterComp;
        //
        //     if (!colIds) {
        //         // execute for all comps when no colIds are supplied
        //         callbackFunc(filterComp);
        //     } else {
        //         const colId = filterComp.getColumn().getColId();
        //         const shouldExecute = colIds.indexOf(colId) > -1;
        //         if (shouldExecute) {
        //             callbackFunc(filterComp);
        //             executedColIds.push(colId);
        //         }
        //     }
        // }
        //
        // if (colIds) {
        //     const unrecognisedColIds = colIds.filter(colId => executedColIds.indexOf(colId) < 0);
        //     if (unrecognisedColIds.length > 0) {
        //         console.warn('ag-Grid: unable to find filters for colIds:', unrecognisedColIds);
        //     }
        // }
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
        // this.allFilterComps.forEach(filterComp => filterComp.destroy());
        // this.allFilterComps.length = 0;
        _.clearElement(this.getGui());
    }

    public destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
