import {
    _,
    Autowired,
    ColDef,
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
import {ToolPanelFilterGroupComp} from "./toolPanelFilterGroupComp";
import {EXPAND_STATE} from "./filtersToolPanelHeaderPanel";

export class FiltersToolPanelListPanel extends Component {

    private static TEMPLATE = `<div class="ag-filter-list-panel"></div>`;

    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("eventService") private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;

    private initialised = false;

    private params: ToolPanelFiltersCompParams;
    private filterGroupComps: ToolPanelFilterGroupComp[] = [];

    constructor() {
        super(FiltersToolPanelListPanel.TEMPLATE);
    }

    public init(params: ToolPanelFiltersCompParams): void {
        this.initialised = true;

        const defaultParams: ToolPanelFiltersCompParams = {
            suppressExpandAll: false,
            suppressFilter: false,
            syncLayoutWithGrid: false,
            api: this.gridApi
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;

        if (this.params.syncLayoutWithGrid) {
            this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, () => this.syncLayoutWithGrid());
        }

        this.addDestroyableEventListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.onColumnsChanged());

        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    public onColumnsChanged(): void {
        this.destroyFilters();
        const columnTree = this.columnController.getPrimaryColumnTree();
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0);
        this.filterGroupComps.forEach(comp => this.appendChild(comp));
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
                        new ToolPanelFilterGroupComp(child, [filterComp], depth, this.onGroupExpanded.bind(this));

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
            new ToolPanelFilterGroupComp(columnGroup, childFilterComps, depth, this.onGroupExpanded.bind(this));

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

        const updateCount = (filterGroup: ToolPanelFilterGroupComp) => {
            if (!filterGroup.isColumnGroup()) return;
            filterGroup.isExpanded() ? expandedCount++ : notExpandedCount++;

            filterGroup.getChildren().forEach(child => {
                if (child instanceof ToolPanelFilterGroupComp) {
                    updateCount(child);
                }
            });
        };

        this.filterGroupComps.forEach(updateCount);

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
    }

    public syncLayoutWithGrid(): void {
        //TODO
    }
    public setFilterLayout(colDefs: ColDef[]): void {
        //TODO
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
