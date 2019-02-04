import {
    Autowired,
    Component,
    EventService,
    GridOptionsWrapper,
    GridPanel,
    PostConstruct,
    ToolPanelDef,
    Events,
    ToolPanelVisibleChangedEvent,
    _
} from "ag-grid-community";

export class SideBarButtonsComp extends Component {

    private panels: { [key: string]: Component } = {};
    public defaultPanelKey: string | null = null;

    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("eventService") private eventService: EventService;

    private gridPanel: GridPanel;

    private static readonly TEMPLATE: string = `<div class="ag-side-buttons"></div>`;

    constructor() {
        super(SideBarButtonsComp.TEMPLATE);
    }

    public registerPanelComp(key: string, panelComponent: Component): void {
        this.panels[key] = panelComponent;
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    @PostConstruct
    public postConstruct(): void {
        const buttons: { [p: string]: ToolPanelDef } = {};
        const toolPanels: ToolPanelDef[] = _.get(this.gridOptionsWrapper.getSideBar(), 'toolPanels', []);
        toolPanels.forEach((toolPanel: ToolPanelDef) => {
            buttons[toolPanel.id] = toolPanel;
        });

        this.createButtonsHtml(buttons);
    }

    private createButtonsHtml(componentButtons: { [p: string]: ToolPanelDef }): void {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        let html: string = '';
        const keys = Object.keys(componentButtons);
        keys.forEach(key => {
            const def: ToolPanelDef = componentButtons[key];
            html += `<div class="ag-side-button""><button type="button" ref="toggle-button-${key}"><div><span class="ag-icon-${def.iconKey}"></span></div><span>${translate(def.labelKey, def.labelDefault)}</span></button></div>`
        });

        this.getGui().innerHTML = html;

        keys.forEach(key => {
            this.addButtonEvents(key);
        });

        this.defaultPanelKey = _.get(this.gridOptionsWrapper.getSideBar(), 'defaultToolPanel', null);
        const defaultButtonElement: HTMLElement = this.getRefElement(`toggle-button-${this.defaultPanelKey}`);
        if (defaultButtonElement && defaultButtonElement.parentElement) {
            _.addOrRemoveCssClass(defaultButtonElement.parentElement, 'ag-selected', true);
        }
    }

    private addButtonEvents(keyToProcess: string) {
        const btShow = this.getRefElement(`toggle-button-${keyToProcess}`);
        this.addDestroyableEventListener(btShow, 'click', () => this.onButtonPressed(keyToProcess));
    }

    private onButtonPressed(keyPressed: string): void {
        Object.keys(this.panels).forEach(keyToProcess => {
            this.processKeyAfterKeyPressed(keyToProcess, keyPressed);
        })
    }

    private processKeyAfterKeyPressed(keyToProcess: string, keyPressed: string) {
        const panelToProcess = this.panels[keyToProcess];
        const clickingThisPanel = keyToProcess === keyPressed;
        const showThisPanel = clickingThisPanel ? !panelToProcess.isVisible() : false;
        this.setPanelVisibility(keyToProcess, showThisPanel);
    }

    public setPanelVisibility(key: string, show: boolean) {
        const panelToProcess = this.panels[key];

        if (!panelToProcess) {
            console.warn(`ag-grid: can't change the visibility for the non existing tool panel item [${key}]`);
            return;
        }

        panelToProcess.setVisible(show);
        const button: HTMLElement = this.getRefElement(`toggle-button-${key}`);
        if (button.parentElement) {
            _.addOrRemoveCssClass(button.parentElement, 'ag-selected', show);
        }

        const event: ToolPanelVisibleChangedEvent = {
            type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
            source: key,
            api: this.gridOptionsWrapper.getApi()!,
            columnApi: this.gridOptionsWrapper.getColumnApi()!
        };
        this.eventService.dispatchEvent(event);
    }

    public clear() {
        this.setTemplate(SideBarButtonsComp.TEMPLATE);
        this.panels = {};
    }
}
