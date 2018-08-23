import {
    _,
    Autowired,
    Component,
    EventService,
    GridOptionsWrapper,
    GridPanel,
    PostConstruct,
    ToolPanelComponentDef
} from "ag-grid-community";

export class ToolPanelSelectComp extends Component {

    private panels: {[key:string]:Component} = {};

    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("eventService") private eventService: EventService;

    private gridPanel: GridPanel;

    constructor() {
        super(`<div class="ag-side-buttons"></div>`);
    }

    public registerPanelComp(key: string, panelComponent: Component): void {
        this.panels[key] = panelComponent;
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    @PostConstruct
    private postConstruct(): void {
        let buttons:{[p:string]: string} = {};
        let componentDefs: ToolPanelComponentDef[] = _.get(this.gridOptionsWrapper.getToolPanel(), 'components', []);
        componentDefs.forEach((componentDef:ToolPanelComponentDef)=>{
            buttons[componentDef.key] = componentDef.buttonLabel;
        });

        this.createButtonsHtml (buttons);

        let showButtons = !this.gridOptionsWrapper.isToolPanelSuppressSideButtons();
        this.setVisible(showButtons);
    }

    private createButtonsHtml(componentButtons: {[p: string]: string}): void {
        let translate = this.gridOptionsWrapper.getLocaleTextFunc();

        let html: string = '';
        let keys = Object.keys(componentButtons);
        keys.forEach(key=>{
            let value: string = componentButtons[key];
            html += `<div class="ag-side-button""><button type="button" ref="toggle-button-${key}">${translate(key, value)}</button></div>`
        });

        this.getGui().innerHTML = html;

        keys.forEach(key=>{
            this.addButtonEvents(key);
        });

        _.addOrRemoveCssClass(this.getRefElement(`toggle-button-columns`).parentElement, 'ag-selected', true);
    }

    private addButtonEvents(boundKey: string) {
        let btShow = this.getRefElement(`toggle-button-${boundKey}`);
        this.addDestroyableEventListener(btShow, 'click', () => {
            Object.keys(this.panels).forEach(key=>{
                let thisPanel = this.panels[key];
                let clickingThisPanel = key === boundKey;
                let showThisPanel = clickingThisPanel ? !thisPanel.isVisible() : false;
                thisPanel.setVisible(showThisPanel);
                let button: HTMLElement = this.getRefElement(`toggle-button-${key}`);
                _.addOrRemoveCssClass(button.parentElement, 'ag-selected', showThisPanel);
            })
        });
    }
}
