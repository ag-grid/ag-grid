import {
    _,
    Autowired,
    Component,
    EventService,
    GridOptionsWrapper,
    GridPanel,
    PostConstruct,
    ToolPanelItemDef
} from "ag-grid-community";

export class ToolPanelSelectComp extends Component {

    private panels: {[key:string]:Component} = {};
    public defaultPanelKey: string = null;

    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("eventService") private eventService: EventService;

    private gridPanel: GridPanel;

    private static readonly TEMPLATE: string = `<div class="ag-side-buttons"></div>`;

    constructor() {
        super(ToolPanelSelectComp.TEMPLATE);
    }

    public registerPanelComp(key: string, panelComponent: Component): void {
        this.panels[key] = panelComponent;
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    @PostConstruct
    public postConstruct(): void {
        let buttons:{[p:string]: ToolPanelItemDef} = {};
        let componentDefs: ToolPanelItemDef[] = _.get(this.gridOptionsWrapper.getToolPanel(), 'items', []);
        componentDefs.forEach((componentDef:ToolPanelItemDef)=>{
            buttons[componentDef.id] = componentDef;
        });

        this.createButtonsHtml (buttons);
    }

    private createButtonsHtml(componentButtons: {[p: string]: ToolPanelItemDef}): void {
        let translate = this.gridOptionsWrapper.getLocaleTextFunc();

        let html: string = '';
        let keys = Object.keys(componentButtons);
        keys.forEach(key=>{
            let def: ToolPanelItemDef = componentButtons[key];
            html += `<div class="ag-side-button""><button type="button" ref="toggle-button-${key}"><div><span class="ag-icon-${def.iconKey}"></span></div><span>${translate(def.labelKey, def.labelDefault)}</span></button></div>`
        });

        this.getGui().innerHTML = html;

        keys.forEach(key=>{
            this.addButtonEvents(key);
        });

        this.defaultPanelKey = _.get(this.gridOptionsWrapper.getToolPanel(), 'defaultItem', null);
        let defaultButtonElement: HTMLElement = this.getRefElement(`toggle-button-${this.defaultPanelKey}`);
        if (defaultButtonElement) {
           _.addOrRemoveCssClass(defaultButtonElement.parentElement, 'ag-selected', true);
        }
    }

    private addButtonEvents(keyToProcess: string) {
        let btShow = this.getRefElement(`toggle-button-${keyToProcess}`);
        this.addDestroyableEventListener(btShow, 'click', () => this.onButtonPressed(keyToProcess));
    }

    private onButtonPressed (keyPressed: string): void{
        Object.keys(this.panels).forEach(keyToProcess=>{
            this.processKeyAfterKeyPressed(keyToProcess, keyPressed);
        })
    }

    private processKeyAfterKeyPressed(keyToProcess: string, keyPressed: string) {
        let panelToProcess = this.panels[keyToProcess];
        let clickingThisPanel = keyToProcess === keyPressed;
        let showThisPanel = clickingThisPanel ? !panelToProcess.isVisible() : false;
        this.setPanelVisibility(keyToProcess, showThisPanel);
    }

    public setPanelVisibility(key: string, show: boolean) {
        let panelToProcess = this.panels[key];

        if (!panelToProcess) {
            console.warn(`ag-grid: can't change the visibility for the non existing tool panel item [${key}]`)
            return;
        }

        panelToProcess.setVisible(show);
        let button: HTMLElement = this.getRefElement(`toggle-button-${key}`);
        _.addOrRemoveCssClass(button.parentElement, 'ag-selected', show);
    }

    public clear () {
        this.setTemplate(ToolPanelSelectComp.TEMPLATE);
        this.panels = {};
    }
}
