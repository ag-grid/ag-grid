import {Component, GridOptionsWrapper, PostConstruct, Bean, Autowired, Context} from "ag-grid/main";
import {ColumnSelectPanel} from "./columnsSelect/columnSelectPanel";
import {RowGroupColumnsPanel} from "./columnDrop/rowGroupColumnsPanel";
import {PivotColumnsPanel} from "./columnDrop/pivotColumnsPanel";
import {PivotModePanel} from "./columnDrop/pivotModePanel";
import {ValuesColumnPanel} from "./columnDrop/valueColumnsPanel";

@Bean('toolPanel')
export class ToolPanelComp extends Component {

    private static TEMPLATE = '<div class="ag-tool-panel"></div>';

    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private initialised = false;

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
            this.addComponent(new PivotModePanel())
        }

        this.addComponent(new ColumnSelectPanel(true));

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
        this.getHtmlElement().appendChild(component.getHtmlElement());
        this.addDestroyFunc( ()=> {
            component.destroy();
        });
    }
}