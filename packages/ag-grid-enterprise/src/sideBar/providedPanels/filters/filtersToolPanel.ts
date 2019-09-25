import {
    _,
    Autowired,
    ColDef,
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

        const defaultParams: ToolPanelFiltersCompParams = {
            syncLayoutWithGrid: false,
            api: this.gridApi
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;

        this.filtersToolPanelHeaderPanel.init(); //TODO add suppress header panel option

        this.filtersToolPanelListPanel.init(this.params);
    }

    // lazy initialise the panel
    public setVisible(visible: boolean): void {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    }

    public expandFilters(colIds?: string[]): void {
        //TODO
    }
    public collapseFilters(colIds?: string[]): void {
        //TODO
    }
    public syncLayoutWithGrid(): void {
        //TODO
    }
    public setFilterLayout(colDefs: ColDef[]): void {
        //TODO
    }

    public refresh(): void {
        this.init(this.params);
    }

    public destroy(): void {
        super.destroy();
    }
}
