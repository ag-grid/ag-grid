import {
    Component,
    GridApi,
    GridOptionsWrapper,
    PostConstruct,
    Bean,
    Autowired,
    Context
} from "ag-grid/main";
import {ColumnSelectComp} from "./columnsSelect/columnSelectComp";
import {RowGroupColumnsPanel} from "./columnDrop/rowGroupColumnsPanel";
import {PivotColumnsPanel} from "./columnDrop/pivotColumnsPanel";
import {PivotModePanel} from "./columnDrop/pivotModePanel";
import {ValuesColumnPanel} from "./columnDrop/valueColumnsPanel";
import {_, IToolPanel} from "ag-grid";

@Bean("toolPanel")
export class ToolPanelWrapperComp extends Component implements IToolPanel {

    @Autowired("context") private context: Context;

    private buttonComp: ButtonComp;
    private toolPanelComp: ToolPanelComp;

    // solves a race condition, where this is getting initialised after the grid core
    private initialised = false;

    constructor() {
        super(`<div class="ag-tool-panel-wrapper">
                  <div ref="panel-container" class="ag-panel-container"></div>
               </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.init();
    }

    public init(): void {
        if (this.initialised) { return; }
        this.initialised = true;

        this.toolPanelComp = new ToolPanelComp();
        this.buttonComp = new ButtonComp(this.toolPanelComp);

        this.context.wireBean(this.toolPanelComp);
        this.context.wireBean(this.buttonComp);

        this.appendChild(this.buttonComp);
        this.appendChild(this.toolPanelComp);
    }

    public refresh(): void {
        this.toolPanelComp.refresh();
    }

    public showToolPanel(show: boolean): void {
        this.toolPanelComp.setVisible(show);
    }

    public isToolPanelShowing(): boolean {
        return this.toolPanelComp.isVisible();
    }

}

class ButtonComp extends Component {

    private toolPanelComp: ToolPanelComp;

    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    constructor(toolPanelComp: ToolPanelComp) {
        super(`<div class="side-buttons"><button type="button" ref="toggle-button">Tool Panel</button></div>`);
        this.toolPanelComp = toolPanelComp;
    }

    @PostConstruct
    private postConstruct(): void {
        let btShow = this.getRefElement("toggle-button");
        this.addDestroyableEventListener(btShow, 'click', () => {
            this.toolPanelComp.setVisible(!this.toolPanelComp.isVisible());
        });

        let showButtons = this.gridOptionsWrapper.isToolPanelUsingSideButton();
        this.setVisible(showButtons);
    }

}

export class ToolPanelComp extends Component {

    private static TEMPLATE = '<div class="ag-tool-panel"></div>';

    @Autowired("context") private context: Context;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("gridApi") private gridApi: GridApi;

    private initialised = false;

    private childDestroyFuncs: Function[] = [];

    constructor() {
        super(ToolPanelComp.TEMPLATE);
    }

    // lazy initialise the toolPanel
    public setVisible(visible: boolean): void {
        super.setVisible(visible);
        if (visible && !this.initialised) {
            this.init();
        }
    }

    public init(): void {
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
        this.init();
    }

    public destroy(): void {
        this.destroyChildren();
        super.destroy();
    }
}
