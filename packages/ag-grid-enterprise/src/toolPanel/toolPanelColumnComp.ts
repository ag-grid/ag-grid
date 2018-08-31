import {
    _,
    Autowired,
    Component,
    Context,
    Events,
    EventService,
    GridApi,
    GridOptionsWrapper, IComponent,
    ToolPanelVisibleChangedEvent
} from "ag-grid-community";
import {PivotModePanel} from "./columnDrop/pivotModePanel";
import {ValuesColumnPanel} from "./columnDrop/valueColumnsPanel";
import {RowGroupColumnsPanel} from "./columnDrop/rowGroupColumnsPanel";
import {ColumnSelectComp} from "./columnsSelect/columnSelectComp";
import {PivotColumnsPanel} from "./columnDrop/pivotColumnsPanel";

export interface ToolPanelColumnCompParams {
    suppressRowGroups: boolean;
    suppressValues: boolean;
    suppressPivots: boolean;
    suppressPivotMode: boolean;
    suppressSideButtons: boolean;
    suppressColumnFilter: boolean;
    suppressColumnSelectAll: boolean;
    suppressColumnExpandAll: boolean;
    contractColumnSelection: boolean;
    functionsReadOnly: boolean;
}

export class ToolPanelColumnComp extends Component implements IComponent<ToolPanelColumnCompParams>{

    private static TEMPLATE =`<div class="ag-column-panel-center ag-column-panel"></div>`;

    @Autowired("context") private context: Context;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("eventService") private eventService: EventService;

    private initialised = false;
    private params: ToolPanelColumnCompParams;

    private childDestroyFuncs: Function[] = [];

    constructor() {
        super(ToolPanelColumnComp.TEMPLATE);
    }

    // lazy initialise the panel
    public setVisible(visible: boolean): void {
        super.setVisible(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }

        let event: ToolPanelVisibleChangedEvent = {
            type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
        this.eventService.dispatchEvent(event);
    }

    public init(params: ToolPanelColumnCompParams): void {
        let defaultParams:ToolPanelColumnCompParams = {
            suppressSideButtons: false,
            suppressColumnSelectAll: false,
            suppressColumnFilter: false,
            suppressColumnExpandAll: false,
            contractColumnSelection: false,
            suppressPivotMode: false,
            suppressRowGroups: false,
            suppressValues: false,
            suppressPivots: false,
            functionsReadOnly: false
        };
        _.mergeDeep(defaultParams ,params)
        this.params = defaultParams;
        this.instantiate(this.context);

        if (!this.params.suppressPivotMode) {
            this.addComponent(new PivotModePanel());
        }

        this.addComponent(new ColumnSelectComp(true, this.params));

        if (!this.params.suppressRowGroups) {
            this.addComponent(new RowGroupColumnsPanel(false));
        }

        if (!this.params.suppressValues) {
            this.addComponent(new ValuesColumnPanel(false));
        }

        if (!this.params.suppressPivots) {
            this.addComponent(new PivotColumnsPanel(false));
        }

        this.initialised = true;
    }

    private addComponent(component: Component): void {
        this.context.wireBean(component);
        this.getGui().appendChild(component.getGui());
        this.childDestroyFuncs.push(component.destroy.bind(component));
    }

    public destroyChildren(): void {
        this.childDestroyFuncs.forEach(func => func());
        this.childDestroyFuncs.length = 0;
        _.removeAllChildren(this.getGui());
    }

    public refresh(): void {
        this.destroyChildren();
        this.init(this.params);
    }

    public destroy(): void {
        this.destroyChildren();
        super.destroy();
    }
}