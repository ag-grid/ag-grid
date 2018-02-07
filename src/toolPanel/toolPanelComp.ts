import {
    Component,
    GridApi,
    GridOptionsWrapper,
    PostConstruct,
    Bean,
    Autowired,
    GridCore,
    Context
} from "ag-grid/main";
import {ColumnSelectComp} from "./columnsSelect/columnSelectComp";
import {RowGroupColumnsPanel} from "./columnDrop/rowGroupColumnsPanel";
import {PivotColumnsPanel} from "./columnDrop/pivotColumnsPanel";
import {PivotModePanel} from "./columnDrop/pivotModePanel";
import {ValuesColumnPanel} from "./columnDrop/valueColumnsPanel";
import {_, IToolPanel} from "ag-grid";
import {ColumnPanel} from "./columnPanel";

@Bean("toolPanelComp")
export class ToolPanelComp extends Component implements IToolPanel {

    @Autowired("context") private context: Context;

    private buttonComp: PanelSelectComp;
    private toolPanelComp: ColumnPanel;

    // solves a race condition, where this is getting initialised after the grid core.
    // so gridCore also calls init()
    private initialised = false;

    constructor() {
        super(`<div class="ag-tool-panel"/>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.init();
    }

    public init(): void {
        if (this.initialised) { return; }
        this.initialised = true;

        this.toolPanelComp = new ColumnPanel();
        this.buttonComp = new PanelSelectComp(this.toolPanelComp);

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

class PanelSelectComp extends Component {

    private columnPanel: ColumnPanel;

    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("gridCore") private gridCore: GridCore;

    constructor(columnPanel: ColumnPanel) {
        super();
        this.columnPanel = columnPanel;
    }

    private createTemplate() {
        let translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return `<div class="ag-side-buttons">
                    <button type="button" ref="toggle-button">${translate('columns', 'Columns')}</button>
                </div>`;
    }

    @PostConstruct
    private postConstruct(): void {
        this.setTemplate(this.createTemplate());
        let btShow = this.getRefElement("toggle-button");
        this.addDestroyableEventListener(btShow, 'click', () => {
            this.columnPanel.setVisible(!this.columnPanel.isVisible());
            // this gets grid to resize immediately, rather than waiting
            // for next 500ms
            this.gridCore.doLayout();
        });

        let showButtons = this.gridOptionsWrapper.isToolPanelUsingSideButton();
        this.setVisible(showButtons);
    }

}
