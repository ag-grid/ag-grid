import {
    _,
    Autowired,
    ColDef, ColGroupDef,
    ColumnController,
    Component,
    EventService,
    GridApi,
    IToolPanelComp,
    IToolPanelParams,
    RefSelector
} from "ag-grid-community";
import {FiltersToolPanelHeaderPanel} from "./filtersToolPanelHeaderPanel";
import {FiltersToolPanelListPanel} from "./filtersToolPanelListPanel";

export interface ToolPanelFiltersCompParams extends IToolPanelParams {
    suppressExpandAll: boolean;
    suppressFilter: boolean;
    syncLayoutWithGrid: boolean;
}

export interface IFiltersToolPanel {
    setFilterLayout(colDefs: ColDef[]): void;
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
    syncLayoutWithGrid(): void;
}

export class FiltersToolPanel extends Component implements IFiltersToolPanel, IToolPanelComp {

    private static TEMPLATE =
        `<div class="ag-filter-panel">
            <ag-filters-tool-panel-header ref="filtersToolPanelHeaderPanel"></ag-filters-tool-panel-header>
            <ag-filters-tool-panel-list ref="filtersToolPanelListPanel"></ag-filters-tool-panel-list> 
         </div>`;

    @RefSelector('filtersToolPanelHeaderPanel')
    private filtersToolPanelHeaderPanel: FiltersToolPanelHeaderPanel;

    @RefSelector('filtersToolPanelListPanel')
    private filtersToolPanelListPanel: FiltersToolPanelListPanel;

    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("eventService") private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;

    private initialised = false;
    private params: ToolPanelFiltersCompParams;

    constructor() {
        super(FiltersToolPanel.TEMPLATE);
    }

    public init(params: ToolPanelFiltersCompParams): void {
        this.initialised = true;

        //TODO add suppress header panel option
        const defaultParams: ToolPanelFiltersCompParams = {
            suppressExpandAll: false,
            suppressFilter: false,
            syncLayoutWithGrid: true,
            api: this.gridApi
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;

        this.filtersToolPanelHeaderPanel.init(this.params);
        this.filtersToolPanelListPanel.init(this.params);

        this.addDestroyableEventListener(this.filtersToolPanelHeaderPanel, 'expandAll', this.onExpandAll.bind(this));
        this.addDestroyableEventListener(this.filtersToolPanelHeaderPanel, 'collapseAll', this.onCollapseAll.bind(this));
        this.addDestroyableEventListener(this.filtersToolPanelHeaderPanel, 'searchChanged', this.onSearchChanged.bind(this));

        this.addDestroyableEventListener(this.filtersToolPanelListPanel, 'groupExpanded', this.onGroupExpanded.bind(this));
    }

    // lazy initialise the panel
    public setVisible(visible: boolean): void {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    }

    public onExpandAll(): void {
        this.filtersToolPanelListPanel.expandFilterGroups(true);
    }

    public onCollapseAll(): void {
        this.filtersToolPanelListPanel.expandFilterGroups(false);
    }

    private onSearchChanged(event: any): void {
        this.filtersToolPanelListPanel.performFilterSearch(event.searchText);
    }

    public setFilterLayout(colDefs: (ColDef | ColGroupDef)[]): void {
        this.filtersToolPanelListPanel.setFiltersLayout(colDefs);
    }

    private onGroupExpanded(event: any): void {
        this.filtersToolPanelHeaderPanel.setExpandState(event.state);
    }

    public expandFilters(colIds?: string[]): void {
        //TODO
    }
    public collapseFilters(colIds?: string[]): void {
        //TODO
    }
    public syncLayoutWithGrid(): void {
        this.filtersToolPanelListPanel.syncFilterLayout();
    }

    public refresh(): void {
        this.init(this.params);
    }

    public destroy(): void {
        super.destroy();
    }
}
