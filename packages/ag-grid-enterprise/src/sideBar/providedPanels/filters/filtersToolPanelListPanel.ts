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

export class FiltersToolPanelListPanel extends Component {

    private static TEMPLATE = `<div class="ag-filter-list-panel"></div>`;

    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("eventService") private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;

    private initialised = false;

    private params: ToolPanelFiltersCompParams;

    constructor() {
        super(FiltersToolPanelListPanel.TEMPLATE);
    }

    public init(params: ToolPanelFiltersCompParams): void {
        this.initialised = true;

        const defaultParams: ToolPanelFiltersCompParams = {
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

        const comps = this.recursivelyAddComps(columnTree, 0);
        comps.forEach(comp => {
            if (comp) this.appendChild(comp);
        });
    }

    private recursivelyAddComps(tree: OriginalColumnGroupChild[], depth: number): (ToolPanelFilterGroupComp | null)[] {
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
                    const filterGroupComp = new ToolPanelFilterGroupComp(child, [filterComp], depth);
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

        const filterGroupComp = new ToolPanelFilterGroupComp(columnGroup, childFilterComps, depth);
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
