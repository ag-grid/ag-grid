import {Events, ToolPanelVisibleChangedEvent, _, Autowired, Component, Context, GridApi, GridOptionsWrapper, EventService} from "ag-grid/main";
import {PivotModePanel} from "./columnDrop/pivotModePanel";
import {ValuesColumnPanel} from "./columnDrop/valueColumnsPanel";
import {RowGroupColumnsPanel} from "./columnDrop/rowGroupColumnsPanel";
import {ColumnSelectComp} from "./columnsSelect/columnSelectComp";
import {PivotColumnsPanel} from "./columnDrop/pivotColumnsPanel";
import {RefSelector} from "ag-grid";

export class ToolPanelColumnComp extends Component {

    private static TEMPLATE =
        `<div class="ag-column-panel">
            <ag-horizontal-resize class="ag-tool-panel-horizontal-resize" [component-to-resize]="componentToResize"></ag-horizontal-resize>
            <div class="ag-column-panel-center" ref="eColumnPanelCenter"></div>
        </div>`;

    @Autowired("context") private context: Context;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("eventService") private eventService: EventService;

    private initialised = false;

    private childDestroyFuncs: Function[] = [];

    // referenced in template
    private componentToResize = this;

    @RefSelector('eColumnPanelCenter')
    private eCenterPanel: HTMLElement;

    constructor() {
        super(ToolPanelColumnComp.TEMPLATE);
    }

    // lazy initialise the panel
    public setVisible(visible: boolean): void {
        super.setVisible(visible);
        if (visible && !this.initialised) {
            this.init();
        }

        let event: ToolPanelVisibleChangedEvent = {
            type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
        this.eventService.dispatchEvent(event);
    }

    public init(): void {
        this.instantiate(this.context);

        if (!this.gridOptionsWrapper.isToolPanelSuppressPivotMode()) {
            this.addComponent(new PivotModePanel());
        }

        this.addComponent(new ColumnSelectComp(true));

        if (!this.gridOptionsWrapper.isToolPanelSuppressRowGroups()) {
            this.addComponent(new RowGroupColumnsPanel(false));
        }

        if (!this.gridOptionsWrapper.isToolPanelSuppressValues()) {
            this.addComponent(new ValuesColumnPanel(false));
        }

        if (!this.gridOptionsWrapper.isToolPanelSuppressPivots()) {
            this.addComponent(new PivotColumnsPanel(false));
        }

        this.initialised = true;
    }

    private addComponent(component: Component): void {
        this.context.wireBean(component);
        this.eCenterPanel.appendChild(component.getGui());
        this.childDestroyFuncs.push(component.destroy.bind(component));
    }

    public destroyChildren(): void {
        this.childDestroyFuncs.forEach(func => func());
        this.childDestroyFuncs.length = 0;
        _.removeAllChildren(this.eCenterPanel);
    }

    public refresh(): void {
        this.destroyChildren();
        this.init();
    }

    public destroy(): void {
        this.destroyChildren();
        super.destroy();
    }
}