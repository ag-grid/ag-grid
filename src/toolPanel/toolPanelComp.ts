import {Component, PostConstruct, Bean, Autowired, Context} from "ag-grid/main";
import {ColumnSelectPanel} from "./columnsSelect/columnSelectPanel";
import {RowGroupColumnsPanel} from "./columnDrop/rowGroupColumnsPanel";
import {PivotColumnsPanel} from "./columnDrop/pivotColumnsPanel";

@Bean('toolPanel')
export class ToolPanelComp extends Component {

    private static TEMPLATE = '<div class="ag-tool-panel"></div>';

    @Autowired('context') private context: Context;

    private columnSelectPanel: ColumnSelectPanel;

    constructor() {
        super(ToolPanelComp.TEMPLATE);
    }

    @PostConstruct
    public init(): void {

        this.columnSelectPanel = new ColumnSelectPanel(true);
        this.context.wireBean(this.columnSelectPanel);

        this.addInWrapper(this.columnSelectPanel.getGui(), '100%');

        var p2 = new RowGroupColumnsPanel(false);
        var p4 = new PivotColumnsPanel(false);

        this.context.wireBean(p2);
        this.context.wireBean(p4);

        // this.addInWrapper(p2.getGui(), '15%');
        // this.addInWrapper(p4.getGui(), '15%');
    }

    private addInWrapper(eElement: HTMLElement, height: string): void {
        var eDiv = document.createElement('div');
        eDiv.style.height = height;
        eDiv.appendChild(eElement);
        this.getGui().appendChild(eDiv);
    }
}