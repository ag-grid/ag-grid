import {Bean} from "../context/context";
import {Qualifier} from "../context/context";
import {ColumnSelectPanel} from "../enterprise/columnSelect/columnSelectPanel";
import {Context} from "../context/context";
import {Autowired} from "../context/context";
import {Utils as _} from '../utils';
import {PostConstruct} from "../context/context";
import {Component} from "../widgets/component";

@Bean('toolPanel')
export class ToolPanel extends Component {

    private static TEMPLATE = '<div class="ag-tool-panel"></div>';

    @Autowired('context') private context: Context;

    private columnSelectPanel: ColumnSelectPanel;

    constructor() {
        super(ToolPanel.TEMPLATE);
    }

    public agWire(): void {
        this.columnSelectPanel = new ColumnSelectPanel(true);
    }

    @PostConstruct
    public init(): void {
        this.context.wireBean(this.columnSelectPanel);
        this.getGui().appendChild(this.columnSelectPanel.getGui());
    }

}
