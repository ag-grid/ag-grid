import {
    _,
    Autowired,
    Component,
    Events,
    EventService,
    GridOptionsWrapper,
    IComponent,
    ISideBar,
    IToolPanel,
    ModuleNames, ModuleRegistry,
    PostConstruct,
    RefSelector,
    SideBarDef,
    ToolPanelDef,
    ToolPanelVisibleChangedEvent
} from "@ag-community/grid-core";
import {SideBarButtonClickedEvent, SideBarButtonsComp} from "./sideBarButtonsComp";
import {ToolPanelWrapper} from "./toolPanelWrapper";

export interface IToolPanelChildComp extends IComponent<any> {
    refresh(): void;
}

export class SideBarComp extends Component implements ISideBar {

    @Autowired("eventService") private eventService: EventService;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('sideBarButtons') private sideBarButtonsComp: SideBarButtonsComp;

    private toolPanelWrappers: ToolPanelWrapper[] = [];

    private static readonly TEMPLATE =
        `<div class="ag-side-bar ag-unselectable">
              <ag-side-bar-buttons ref="sideBarButtons">
          </div>`;

    constructor() {
        super(SideBarComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.sideBarButtonsComp.addEventListener(SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED, this.onToolPanelButtonClicked.bind(this));
        this.setSideBarDef();
    }

    private onToolPanelButtonClicked(event: SideBarButtonClickedEvent): void {
        const id = event.toolPanelId;
        const openedItem = this.openedItem();

        // if item was already open, we close it
        if (openedItem === id) {
            this.openToolPanel(undefined); // passing undefined closes
        } else {
            this.openToolPanel(id);
        }
    }

    private clearDownUi(): void {
        this.sideBarButtonsComp.clearButtons();
        this.destroyToolPanelWrappers();
    }

    private setSideBarDef(): void {
        // initially hide side bar
        this.setDisplayed(false);

        const sideBar: SideBarDef = this.gridOptionsWrapper.getSideBar();
        const sideBarExists = !!sideBar && !!sideBar.toolPanels;

        if (sideBarExists) {
            const shouldDisplaySideBar = sideBarExists && !sideBar.hiddenByDefault;
            this.setSideBarPosition(sideBar.position);
            this.setDisplayed(shouldDisplaySideBar);

            const toolPanelDefs = sideBar.toolPanels as ToolPanelDef[];
            this.sideBarButtonsComp.setToolPanelDefs(toolPanelDefs);
            this.setupToolPanels(toolPanelDefs);

            if (!sideBar.hiddenByDefault) {
                this.openToolPanel(sideBar.defaultToolPanel);
            }
        }
    }

    public setSideBarPosition(side?: 'left' | 'right'): this {
        if (!side) { side = 'right'; }
        const eGui = this.getGui();

        _.addOrRemoveCssClass(eGui, 'ag-side-bar-left', side === 'left');
        _.addOrRemoveCssClass(eGui, 'ag-side-bar-right', side === 'right');

        return this;
    }

    private setupToolPanels(defs: ToolPanelDef[]): void {
        defs.forEach(def => {
            if (def.id == null) {
                console.warn(`ag-grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id`);
                return;
            }

            // helpers, in case user doesn't have the right module loaded
            if (def.toolPanel==='agColumnsToolPanel') {
                const moduleMissing =
                    !ModuleRegistry.assertRegistered(ModuleNames.ColumnToolPanelModule, 'Column Tool Panel');
                if (moduleMissing) { return; }
            }

            if (def.toolPanel==='agFiltersToolPanel') {
                const moduleMissing =
                    !ModuleRegistry.assertRegistered(ModuleNames.FiltersToolPanelModule, 'Filters Tool Panel');
                if (moduleMissing) { return; }
            }

            const wrapper = new ToolPanelWrapper();
            this.getContext().wireBean(wrapper);
            wrapper.setToolPanelDef(def);
            wrapper.setDisplayed(false);
            this.getGui().appendChild(wrapper.getGui());

            this.toolPanelWrappers.push(wrapper);
        });
    }

    public refresh(): void {
        this.toolPanelWrappers.forEach(wrapper => wrapper.refresh());
    }

    public openToolPanel(key: string | undefined): void {
        const currentlyOpenedKey = this.openedItem();
        if (currentlyOpenedKey === key) { return; }

        this.toolPanelWrappers.forEach(wrapper => {
            const show = key === wrapper.getToolPanelId();
            wrapper.setDisplayed(show);
        });

        const newlyOpenedKey = this.openedItem();
        const openToolPanelChanged = currentlyOpenedKey !== newlyOpenedKey;
        if (openToolPanelChanged) {
            this.sideBarButtonsComp.setActiveButton(key);
            this.raiseToolPanelVisibleEvent(key);
        }
    }

    public getToolPanelInstance(key: string): IToolPanel | undefined {
        const toolPanelWrapper = this.toolPanelWrappers.filter(toolPanel => toolPanel.getToolPanelId() === key)[0];

        if (!toolPanelWrapper) {
            console.warn(`ag-grid: unable to lookup Tool Panel as invalid key supplied: ${key}`);
            return;
        }

        return toolPanelWrapper.getToolPanelInstance();
    }

    private raiseToolPanelVisibleEvent(key: string | undefined): void {
        const event: ToolPanelVisibleChangedEvent = {
            type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
            source: key,
            api: this.gridOptionsWrapper.getApi()!,
            columnApi: this.gridOptionsWrapper.getColumnApi()!
        };
        this.eventService.dispatchEvent(event);
    }

    public close(): void {
        this.openToolPanel(undefined);
    }

    public isToolPanelShowing(): boolean {
        return !!this.openedItem();
    }

    public openedItem(): string | null {
        let activeToolPanel: string | null = null;
        this.toolPanelWrappers.forEach(wrapper => {
            if (wrapper.isDisplayed()) {
                activeToolPanel = wrapper.getToolPanelId();
            }
        });
        return activeToolPanel;
    }

    // get called after user sets new sideBarDef via the API
    public reset(): void {
        this.clearDownUi();
        this.setSideBarDef();
    }

    private destroyToolPanelWrappers(): void {
        this.toolPanelWrappers.forEach(wrapper => {
            _.removeFromParent(wrapper.getGui());
            wrapper.destroy();
        });
        this.toolPanelWrappers.length = 0;
    }

    public destroy(): void {
        this.destroyToolPanelWrappers();
        super.destroy();
    }
}
