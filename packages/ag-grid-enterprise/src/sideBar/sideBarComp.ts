import {
    _,
    Autowired,
    Component,
    ComponentResolver,
    Context,
    EventService,
    GridOptionsWrapper,
    GridPanel,
    IComponent,
    ISideBar,
    PostConstruct,
    Promise,
    RefSelector,
    SideBarDef,
    ToolPanelDef
} from "ag-grid-community";
import {SideBarButtonsComp} from "./sideBarButtonsComp";
import {ToolPanelWrapper, ToolPanelWrapperParams} from "./toolPanelWrapper";

export interface IToolPanelChildComp extends IComponent<any> {
    refresh(): void
}

export class SideBarComp extends Component implements ISideBar {

    @Autowired("context") private context: Context;
    @Autowired("eventService") private eventService: EventService;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("componentResolver") private componentResolver: ComponentResolver;

    @RefSelector('sideBarButtons') private sideBarButtonsComp: SideBarButtonsComp;
    private panelComps: { [p: string]: ToolPanelWrapper } = {};

    private static readonly TEMPLATE = `<div class="ag-side-bar">
              <ag-side-bar-buttons ref="sideBarButtons">
          </div>`;

    constructor() {
        super(SideBarComp.TEMPLATE);
    }

    // this was deprecated in v19, we can drop in v20
    public getPreferredWidth(): number {
        return this.getGui().clientWidth;
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.sideBarButtonsComp.registerGridComp(gridPanel);
    }

    @PostConstruct
    private postConstruct(): void {
        this.instantiate(this.context);
        let sideBar: SideBarDef = this.gridOptionsWrapper.getSideBar();

        if (sideBar == null) {
            this.getGui().removeChild(this.sideBarButtonsComp.getGui());
            return;
        }

        let allPromises: Promise<IComponent<any>>[] = [];
        if (sideBar.toolPanels) {
            sideBar.toolPanels.forEach((toolPanel: ToolPanelDef) => {
                if (toolPanel.id == null) {
                    console.warn(`ag-grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id`);
                    return;
                }
                let componentPromise: Promise<IComponent<any>> = this.componentResolver.createAgGridComponent(
                    toolPanel,
                    toolPanel.toolPanelParams,
                    'toolPanel',
                    null
                );
                if (componentPromise == null) {
                    console.warn(`ag-grid: error processing tool panel component ${toolPanel.id}. You need to specify either 'toolPanel' or 'toolPanelFramework'`);
                    return;
                }
                allPromises.push(componentPromise);
                componentPromise.then(component => {
                    let wrapper: ToolPanelWrapper = this.componentResolver.createInternalAgGridComponent<ToolPanelWrapperParams, ToolPanelWrapper>(ToolPanelWrapper, {
                        innerComp: component
                    });
                    this.panelComps [toolPanel.id] = wrapper;
                });
            });
        }
        Promise.all(allPromises).then(done => {
            Object.keys(this.panelComps).forEach(key => {
                let currentComp = this.panelComps[key];
                this.getGui().appendChild(currentComp.getGui());
                this.sideBarButtonsComp.registerPanelComp(key, currentComp);
                currentComp.setVisible(false);
            });

            if (_.exists(this.sideBarButtonsComp.defaultPanelKey) && this.sideBarButtonsComp.defaultPanelKey) {
                this.sideBarButtonsComp.setPanelVisibility(this.sideBarButtonsComp.defaultPanelKey, true);
            }
        })
    }

    public refresh(): void {
        Object.keys(this.panelComps).forEach(key => {
            let currentComp = this.panelComps[key];
            currentComp.refresh();
        });
    }

    public setVisible(show: boolean): void {
        if (_.get(this.gridOptionsWrapper.getSideBar(), 'toolPanels', []).length === 0) return;

        super.setVisible(show);
        if (show) {
            let keyOfTabToShow: string | undefined | null  = this.getActiveToolPanelItem();

            if (!keyOfTabToShow) return;

            keyOfTabToShow = keyOfTabToShow ? keyOfTabToShow : _.get(this.gridOptionsWrapper.getSideBar(), 'defaultToolPanel', null);
            keyOfTabToShow = keyOfTabToShow ? keyOfTabToShow : this.gridOptionsWrapper.getSideBar().defaultToolPanel;

            let tabToShow: Component | null = keyOfTabToShow ? this.panelComps[keyOfTabToShow] : null;
            if (!tabToShow) {
                console.warn(`ag-grid: can't set the visibility of the tool panel item [${keyOfTabToShow}] since it can't be found`);
                return;
            }
            tabToShow.setVisible(true);
        }
    }

    public openToolPanel(key: string) {
        let currentlyOpenedKey = this.getActiveToolPanelItem();
        if (currentlyOpenedKey === key) return;

        let tabToShow: Component = this.panelComps[key];
        if (!tabToShow) {
            console.warn(`ag-grid: invalid tab key [${key}] to open for the tool panel`);
            return;
        }

        if (currentlyOpenedKey != null) {
            this.sideBarButtonsComp.setPanelVisibility(currentlyOpenedKey, false);
        }
        this.sideBarButtonsComp.setPanelVisibility(key, true);
    }

    public close(): void {
        let currentlyOpenedKey = this.getActiveToolPanelItem();
        if (!currentlyOpenedKey) return;

        this.sideBarButtonsComp.setPanelVisibility(currentlyOpenedKey, false);
    }

    public isToolPanelShowing(): boolean {
        return this.getActiveToolPanelItem() != null;
    }

    public getActiveToolPanelItem(): string | null {
        let activeToolPanel: string | null = null;
        Object.keys(this.panelComps).forEach(key => {
            let currentComp = this.panelComps[key];
            if (currentComp.isVisible()) {
                activeToolPanel = key;
            }
        });
        return activeToolPanel;
    }

    public openedItem(): string | null {
        return this.getActiveToolPanelItem();
    }

    public reset(): void {
        this.sideBarButtonsComp.clear();
        this.panelComps = {};
        this.setTemplate(SideBarComp.TEMPLATE);
        this.postConstruct();
    }
}
