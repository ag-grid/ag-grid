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
    ToolPanelComponentDef,
    IComponent,
    Promise, _
} from "ag-grid-community";
import {ToolPanelSelectComp} from "./toolPanelSelectComp";

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
    private panelComps: { [p: string]: IToolPanelChildComp & Component } = {};

    constructor() {
        super(`<div class="ag-tool-panel" ref="eToolPanel">
                  <ag-tool-panel-select-comp ref="toolPanelSelectComp"></ag-tool-panel-select-comp>
              </div>`);
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
        let allPromises: Promise<IComponent<any>>[] = [];
        if (toolPanel.components) {
            toolPanel.components.forEach((toolPanelComponentDef: ToolPanelComponentDef) => {
                if (toolPanelComponentDef.key == null) {
                    console.warn(`ag-grid: please review all your toolPanel components, it seems like at least one of them doesn't have a key`);
                    return;
                }
                let componentPromise: Promise<IComponent<any>> = this.componentResolver.createAgGridComponent(
                    toolPanelComponentDef,
                    null,
                    'component',
                    null
                );
                if (componentPromise == null) {
                    console.warn(`ag-grid: error processing tool panel component ${toolPanelComponentDef.key}. You need to specify either 'component' or 'componentFramework'`);
                    return;
                }
                allPromises.push(componentPromise);
                componentPromise.then(component => {
                    this.panelComps [toolPanelComponentDef.key] = component;
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
        })
        // this.toolPanelSelectComp.registerPanelComp('columns', this.columnComp);
        // this.toolPanelSelectComp.registerPanelComp('filters', this.filterComp);
        // this.filterComp.setVisible(false);
    }

    public refresh(): void {
        // this.columnComp.refresh();
        // this.filterComp.refresh();
        Object.keys(this.panelComps).forEach(key => {
            let currentComp = this.panelComps[key];
            currentComp.refresh ();
        });
    }

    public showToolPanel(show: boolean | string): void {
        let tabToShowHide: Component;
        let visibility: boolean;
        let keyOfTabToShowHide: string;
        if (typeof show === 'string') {
            visibility = true;
            tabToShowHide = this.panelComps[show];
            keyOfTabToShowHide = show;
        } else {
            visibility = show;
            keyOfTabToShowHide = _.get(this.gridOptionsWrapper.getToolPanel(), 'defaultTab', null);
            tabToShowHide = this.panelComps[keyOfTabToShowHide];
        }

        if (!tabToShowHide) {
            console.warn (`ag-grid: unable to access the tool panel tab with the key: '${keyOfTabToShowHide}'`);
            return;
        }
        tabToShowHide.setVisible(visibility);
    }


    public isToolPanelShowing(): boolean {
        let anyShowing: boolean = false;
        Object.keys(this.panelComps).forEach(key => {
            let currentComp = this.panelComps[key];
            if (currentComp.isVisible()) {
                anyShowing = true;
            }
        });
        return anyShowing;
    }
}
