import {Bean} from "../context/context";
import {Qualifier} from "../context/context";
import {ColumnSelectPanel} from "../enterprise/columnSelect/columnSelectPanel";
import {Context} from "../context/context";
import {Autowired} from "../context/context";
import _ from '../utils';
import {PostConstruct} from "../context/context";

@Bean('toolPanel')
export default class ToolPanel {

    private static TEMPLATE = '<div class="ag-tool-panel"></div>';

    @Autowired('context') private context: Context;

    private eGui: HTMLElement;
    private columnSelectPanel: ColumnSelectPanel;

    public agWire(): void {
        this.columnSelectPanel = new ColumnSelectPanel(true);
        this.eGui = _.loadTemplate(ToolPanel.TEMPLATE);
    }

    @PostConstruct
    public init(): void {
        this.context.wireBean(this.columnSelectPanel);
        this.eGui.appendChild(this.columnSelectPanel.getGui());
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}
