import {Bean} from "ag-grid/main";
import {Component} from "ag-grid/main";
import {Autowired} from "ag-grid/main";
import {Context} from "ag-grid/main";
import {PostConstruct} from "ag-grid/main";
import {ColumnSelectPanel} from "./columnSelect/columnSelectPanel";

@Bean('toolPanel')
export class ToolPanel extends Component {

    private static TEMPLATE = '<div class="ag-tool-panel"></div>';

    @Autowired('context') private context: Context;

    private columnSelectPanel: ColumnSelectPanel;

    constructor() {
        super(ToolPanel.TEMPLATE);
    }

    @PostConstruct
    public init(): void {
        this.columnSelectPanel = new ColumnSelectPanel(true);
        this.context.wireBean(this.columnSelectPanel);
        this.getGui().appendChild(this.columnSelectPanel.getGui());
    }

}
