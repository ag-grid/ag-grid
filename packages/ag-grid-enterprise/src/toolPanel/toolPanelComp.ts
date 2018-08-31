import {
    Autowired,
    Component, ComponentResolver,
    Context,
    EventService,
    GridOptionsWrapper,
    GridPanel,
    IToolPanel,
    PostConstruct,
    RefSelector,
    ToolPanelDef,
    ToolPanelItemDef,
    IComponent,
    Promise, _
} from "ag-grid-community";
import {ToolPanelSelectComp} from "./toolPanelSelectComp";
import {ToolPanelWrapper, ToolPanelWrapperParams} from "./toolPanelWrapper";

export interface IToolPanelChildComp extends IComponent<any>{
    refresh(): void
}

export class ToolPanelComp extends Component implements IToolPanel {

    @Autowired("context") private context: Context;
    @Autowired("eventService") private eventService: EventService;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("componentResolver") private componentResolver: ComponentResolver;

    @RefSelector('toolPanelSelectComp') private toolPanelSelectComp: ToolPanelSelectComp;
    // @RefSelector('columnComp') private columnComp: ToolPanelColumnComp;
    // @RefSelector('filterComp') private filterComp: ToolPanelAllFiltersComp;
    private panelComps: { [p: string]: ToolPanelWrapper } = {};
    private static readonly TEMPLATE = `<div class="ag-tool-panel" ref="eToolPanel">
              <ag-tool-panel-select-comp ref="toolPanelSelectComp"></ag-tool-panel-select-comp>
          </div>`;

    constructor() {
        super(ToolPanelComp.TEMPLATE);
    }

    // this was deprecated in v19, we can drop in v20
    public getPreferredWidth(): number {
        return this.getGui().clientWidth;
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.toolPanelSelectComp.registerGridComp(gridPanel);
    }

    @PostConstruct
    private postConstruct(): void {
        this.instantiate(this.context);
        let toolPanel: ToolPanelDef = this.gridOptionsWrapper.getToolPanel();

        if (toolPanel == null) {
            this.getGui().removeChild(this.toolPanelSelectComp.getGui());
            return;
        }

        let allPromises: Promise<IComponent<any>>[] = [];
        if (toolPanel.items) {
            toolPanel.items.forEach((toolPanelComponentDef: ToolPanelItemDef) => {
                if (toolPanelComponentDef.id == null) {
                    console.warn(`ag-grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id`);
                    return;
                }
                let componentPromise: Promise<IComponent<any>> = this.componentResolver.createAgGridComponent(
                    toolPanelComponentDef,
                    toolPanelComponentDef.componentParams,
                    'component',
                    null
                );
                if (componentPromise == null) {
                    console.warn(`ag-grid: error processing tool panel component ${toolPanelComponentDef.id}. You need to specify either 'component' or 'componentFramework'`);
                    return;
                }
                allPromises.push(componentPromise);
                componentPromise.then(component => {
                    let wrapper: ToolPanelWrapper = this.componentResolver.createInternalAgGridComponent<ToolPanelWrapperParams, ToolPanelWrapper>(ToolPanelWrapper, {
                        innerComp: component
                    });
                    this.panelComps [toolPanelComponentDef.id] = wrapper;
                });
            });
        }
        Promise.all(allPromises).then(done => {
            Object.keys(this.panelComps).forEach(key => {
                let currentComp = this.panelComps[key];
                this.getGui().appendChild(currentComp.getGui());
                this.toolPanelSelectComp.registerPanelComp(key, currentComp);
                currentComp.setVisible(false);
            });

            this.toolPanelSelectComp.setPanelVisibility(this.toolPanelSelectComp.defaultPanelKey, true);
        })
    }

    public refresh(): void {
        // this.columnComp.refresh();
        // this.filterComp.refresh();
        Object.keys(this.panelComps).forEach(key => {
            let currentComp = this.panelComps[key];
            currentComp.refresh ();
        });
    }

    public setVisible (show:boolean): void{
        if (_.get(this.gridOptionsWrapper.getToolPanel(), 'items', []).length === 0) return;

        super.setVisible(show);
        if (show) {
            let keyOfTabToShow: string = this.getActiveToolPanelItem();
            keyOfTabToShow = keyOfTabToShow ? keyOfTabToShow : _.get(this.gridOptionsWrapper.getToolPanel(), 'defaultItem', null);
            keyOfTabToShow = keyOfTabToShow ? keyOfTabToShow : (<ToolPanelItemDef[]>this.gridOptionsWrapper.getToolPanel().items) [0].id;
            let tabToShow: Component = this.panelComps[keyOfTabToShow];
            if (!tabToShow) {
                console.warn(`ag-grid: can't set the visibility of the tool panel item [${keyOfTabToShow}] since it can't be found`);
                return;
            }
            tabToShow.setVisible(true);
        }
    }

    public openToolPanel (key:string) {
        let currentlyOpenedKey = this.getActiveToolPanelItem();
        if (currentlyOpenedKey === key) return;

        let tabToShow: Component = this.panelComps[key];
        if (!tabToShow) {
            console.warn(`ag-grid: invalid tab key [${key}] to open for the tool panel`);
            return;
        }

        if (currentlyOpenedKey != null){
            this.toolPanelSelectComp.setPanelVisibility(currentlyOpenedKey, false);
        }
        this.toolPanelSelectComp.setPanelVisibility(key, true);
    }

    public close (): void {
        let currentlyOpenedKey = this.getActiveToolPanelItem();
        if (!currentlyOpenedKey) return;

        this.toolPanelSelectComp.setPanelVisibility(currentlyOpenedKey, false);
    }


    public isToolPanelShowing(): boolean {
        return this.getActiveToolPanelItem() != null;
    }

    public getActiveToolPanelItem (): string {
        let activeToolPanel: string = null;
        Object.keys(this.panelComps).forEach(key => {
            let currentComp = this.panelComps[key];
            if (currentComp.isVisible()) {
                activeToolPanel = key;
            }
        });
        return activeToolPanel;
    }

    public openedItem(): string {
        return this.getActiveToolPanelItem();
    }

    public reset (): void {
        this.toolPanelSelectComp.clear ();
        this.panelComps = {};
        this.setTemplate(ToolPanelComp.TEMPLATE);
        this.postConstruct();
    }
}
