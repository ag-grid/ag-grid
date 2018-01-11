import {Component, GridOptionsWrapper, PostConstruct, Bean, Autowired, Context} from "ag-grid/main";
import {ColumnSelectComp} from "./columnsSelect/columnSelectComp";
import {RowGroupColumnsPanel} from "./columnDrop/rowGroupColumnsPanel";
import {PivotColumnsPanel} from "./columnDrop/pivotColumnsPanel";
import {PivotModePanel} from "./columnDrop/pivotModePanel";
import {ValuesColumnPanel} from "./columnDrop/valueColumnsPanel";
import {_, IToolPanel} from 'ag-grid';

@Bean('toolPanel')
export class ToolPanelComp extends Component implements IToolPanel {

    private static TEMPLATE = '<div class="ag-tool-panel"></div>';

    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

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
            this.addComponent(new PivotModePanel())
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
        this.childDestroyFuncs.push(component.destroy.bind(component))
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
