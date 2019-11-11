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
    RefSelector,
    IFiltersToolPanel
} from "@ag-grid-community/core";
import {FiltersToolPanelHeaderPanel} from "./filtersToolPanelHeaderPanel";
import {FiltersToolPanelListPanel} from "./filtersToolPanelListPanel";

export interface ToolPanelFiltersCompParams extends IToolPanelParams {
    suppressExpandAll: boolean;
    suppressFilterSearch: boolean;
    suppressSyncLayoutWithGrid: boolean;
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

        const defaultParams: ToolPanelFiltersCompParams = {
            suppressExpandAll: false,
            suppressFilterSearch: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;

        this.filtersToolPanelHeaderPanel.init(this.params);
        this.filtersToolPanelListPanel.init(this.params);

        const hideExpand = this.params.suppressExpandAll;
        const hideSearch = this.params.suppressFilterSearch;

        if (hideExpand && hideSearch) {
            this.filtersToolPanelHeaderPanel.setDisplayed(false);
        }

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

    public expandFilterGroups(groupIds?: string[]): void {
        this.filtersToolPanelListPanel.expandFilterGroups(true, groupIds);
    }

    public collapseFilterGroups(groupIds?: string[]): void {
        this.filtersToolPanelListPanel.expandFilterGroups(false, groupIds);
    }

    public expandFilters(colIds?: string[]): void {
        this.filtersToolPanelListPanel.expandFilters(true, colIds);
    }

    public collapseFilters(colIds?: string[]): void {
        this.filtersToolPanelListPanel.expandFilters(false, colIds);
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
