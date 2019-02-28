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
    RefSelector,
    SideBarDef,
    ToolPanelDef
} from "ag-grid-community";
import {SideBarButtonsComp} from "./sideBarButtonsComp";
import {ToolPanelWrapper} from "./toolPanelWrapper";

export interface IToolPanelChildComp extends IComponent<any> {
    refresh(): void
}

export class SideBarComp extends Component implements ISideBar {

    @Autowired("context") private context: Context;
    @Autowired("eventService") private eventService: EventService;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("componentResolver") private componentResolver: ComponentResolver;

    @RefSelector('sideBarButtons') private sideBarButtonsComp: SideBarButtonsComp;

    private toolPanelWrappers: { [p: string]: ToolPanelWrapper } = {};

    private static readonly TEMPLATE = `<div class="ag-side-bar">
              <ag-side-bar-buttons ref="sideBarButtons">
          </div>`;

    constructor() {
        super(SideBarComp.TEMPLATE);
    }

    /** @deprecated in v19, we can drop in v20 */
    public getPreferredWidth(): number {
        return this.getGui().clientWidth;
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.sideBarButtonsComp.registerGridComp(gridPanel);
    }

    @PostConstruct
    private postConstruct(): void {
        this.instantiate(this.context);
        const sideBar: SideBarDef = this.gridOptionsWrapper.getSideBar();

        if (sideBar == null || !sideBar.toolPanels) {
            this.getGui().removeChild(this.sideBarButtonsComp.getGui());
            return;
        }

        const toolPanelDefs = sideBar.toolPanels as ToolPanelDef[];
        toolPanelDefs.forEach(toolPanelDef => {
            if (toolPanelDef.id == null) {
                console.warn(`ag-grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id`);
                return;
            }

            const wrapper = new ToolPanelWrapper();
            this.context.wireBean(wrapper);
            wrapper.setToolPanelDef(toolPanelDef);
            wrapper.setVisible(false);
            this.getGui().appendChild(wrapper.getGui());

            this.toolPanelWrappers[toolPanelDef.id] = wrapper;
            this.sideBarButtonsComp.registerPanelComp(toolPanelDef.id, wrapper);
        });

        if (this.sideBarButtonsComp.defaultPanelKey) {
            this.sideBarButtonsComp.setPanelVisibility(this.sideBarButtonsComp.defaultPanelKey, true);
            this.setVisible(true);
        }
    }

    public refresh(): void {
        Object.keys(this.toolPanelWrappers).forEach(key => {
            const currentComp = this.toolPanelWrappers[key];
            currentComp.refresh();
        });
    }

    public setVisible(show: boolean): void {
        if (_.get(this.gridOptionsWrapper.getSideBar(), 'toolPanels', []).length === 0) { return; }

        super.setVisible(show);
        if (show) {
            let keyOfTabToShow: string | undefined | null  = this.getActiveToolPanelItem();

            if (!keyOfTabToShow) { return; }

            keyOfTabToShow = keyOfTabToShow ? keyOfTabToShow : _.get(this.gridOptionsWrapper.getSideBar(), 'defaultToolPanel', null);
            keyOfTabToShow = keyOfTabToShow ? keyOfTabToShow : this.gridOptionsWrapper.getSideBar().defaultToolPanel;

            const tabToShow: Component | null = keyOfTabToShow ? this.toolPanelWrappers[keyOfTabToShow] : null;
            if (!tabToShow) {
                console.warn(`ag-grid: can't set the visibility of the tool panel item [${keyOfTabToShow}] since it can't be found`);
                return;
            }
            tabToShow.setVisible(true);
        }
    }

    public openToolPanel(key: string) {
        const currentlyOpenedKey = this.getActiveToolPanelItem();
        if (currentlyOpenedKey === key) { return; }

        const tabToShow: Component = this.toolPanelWrappers[key];
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
        const currentlyOpenedKey = this.getActiveToolPanelItem();
        if (!currentlyOpenedKey) { return; }

        this.sideBarButtonsComp.setPanelVisibility(currentlyOpenedKey, false);
    }

    public isToolPanelShowing(): boolean {
        return this.getActiveToolPanelItem() != null;
    }

    public getActiveToolPanelItem(): string | null {
        let activeToolPanel: string | null = null;
        Object.keys(this.toolPanelWrappers).forEach(key => {
            const currentComp = this.toolPanelWrappers[key];
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
        this.destroyToolWrappers();
        this.setTemplate(SideBarComp.TEMPLATE);
        this.postConstruct();
    }

    private destroyToolWrappers(): void {
        _.iterateObject(this.toolPanelWrappers, (key: string, wrapper: ToolPanelWrapper) => {
            wrapper.destroy();
        });
        this.toolPanelWrappers = {};
    }

    public destroy(): void {
        super.destroy();
        this.destroyToolWrappers();
    }
}
