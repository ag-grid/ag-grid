import {
    Autowired,
    Component,
    Context,
    EventService,
    GridOptionsWrapper,
    GridPanel,
    PostConstruct,
    RefSelector
} from "ag-grid";
import {IToolPanel} from "ag-grid";
import {ToolPanelColumnComp} from "./toolPanelColumnComp";
import {ToolPanelSelectComp} from "./toolPanelSelectComp";
import {ToolPanelAllFiltersComp} from "./filter/toolPanelAllFiltersComp";

export class ToolPanelComp extends Component implements IToolPanel {

    @Autowired("context") private context: Context;
    @Autowired("eventService") private eventService: EventService;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('toolPanelSelectComp') private toolPanelSelectComp: ToolPanelSelectComp;
    @RefSelector('columnComp') private columnComp: ToolPanelColumnComp;
    @RefSelector('filterComp') private filterComp: ToolPanelAllFiltersComp;

    constructor() {
        super(`<div class="ag-tool-panel">
                  <ag-tool-panel-select-comp ref="toolPanelSelectComp"></ag-tool-panel-select-comp>
                  <ag-tool-panel-column-comp ref="columnComp"></ag-tool-panel-column-comp>
                  <ag-tool-panel-all-filters-comp ref="filterComp"></ag-tool-panel-all-filters-comp>
              </div>`);
    }

    // this was deprecated in v19, we can drop in v20
    public getPreferredWidth(): number {
        return this.getGui().clientWidth;
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.toolPanelSelectComp.registerGridComp(gridPanel);
    }

    @PostConstruct
    private postConstruct(): void {
        this.instantiate(this.context);
        this.toolPanelSelectComp.registerPanelComp('columns', this.columnComp);
        this.toolPanelSelectComp.registerPanelComp('filters', this.filterComp);
        this.filterComp.setVisible(false);
    }

    public refresh(): void {
        this.columnComp.refresh();
        this.filterComp.refresh();
    }

    public showToolPanel(show: boolean): void {
        this.columnComp.setVisible(show);
    }

    public isToolPanelShowing

    (): boolean {
        return this.columnComp.isVisible() || this.filterComp.isVisible();
    }
}
