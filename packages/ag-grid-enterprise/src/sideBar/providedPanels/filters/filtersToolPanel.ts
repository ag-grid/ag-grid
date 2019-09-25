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
    private childDestroyFuncs: Function[] = [];

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

        this.filtersToolPanelHeaderPanel.init();
        this.filtersToolPanelListPanel.init(this.params);
    }

    // lazy initialise the panel
    public setVisible(visible: boolean): void {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }

        // this.addComponent(new FiltersToolPanelHeaderPanel());
        // this.addComponent(new FiltersToolPanelListPanel());

    }

    public expandFilters(colIds?: string[]): void {}
    public collapseFilters(colIds?: string[]): void {}
    public syncLayoutWithGrid(): void {}
    public setFilterLayout(colDefs: ColDef[]): void {}

    private addComponent(component: Component): void {
        this.getContext().wireBean(component);
        this.getGui().appendChild(component.getGui());
        this.childDestroyFuncs.push(component.destroy.bind(component));
    }

    public destroyChildren(): void {
        this.childDestroyFuncs.forEach(func => func());
        this.childDestroyFuncs.length = 0;
        _.clearElement(this.getGui());
    }

    public refresh(): void {
        this.destroyChildren();
        this.init(this.params);
    }

    public destroy(): void {
        this.destroyChildren();
        super.destroy();
    }

    // private destroyFilters() {
    //     this.allFilterComps.forEach(filterComp => filterComp.destroy());
    //     this.allFilterComps.length = 0;
    //     // _.clearElement(this.getGui()); //TODO
    // }
    //
    // public destroy() {
    //     this.destroyFilters();
    //     super.destroy();
    // }
}
