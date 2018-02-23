import {ToolPanelVisibleChanged, Events, EventService, Autowired, Bean, Component, Context, GridCore, GridOptionsWrapper, PostConstruct} from "ag-grid/main";
import {IToolPanel} from "ag-grid";
import {ColumnPanel} from "./columnPanel";

@Bean("toolPanelComp")
export class ToolPanelComp extends Component implements IToolPanel {

    @Autowired("context") private context: Context;
    @Autowired("eventService") private eventService: EventService;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    private buttonComp: PanelSelectComp;
    private columnPanel: ColumnPanel;

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

        this.columnPanel = new ColumnPanel();
        this.buttonComp = new PanelSelectComp(this.columnPanel);

        this.context.wireBean(this.columnPanel);
        this.context.wireBean(this.buttonComp);

        this.appendChild(this.buttonComp);
        this.appendChild(this.columnPanel);
    }

    public refresh(): void {
        this.columnPanel.refresh();
    }

    public showToolPanel(show: boolean): void {
        this.columnPanel.setVisible(show);
        let event: ToolPanelVisibleChanged = {
            type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
        this.eventService.dispatchEvent(event);
    }

    public isToolPanelShowing(): boolean {
        return this.columnPanel.isVisible();
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

        let showButtons = !this.gridOptionsWrapper.isToolPanelSuppressSideButtons();
        this.setVisible(showButtons);
    }

}
