import {
    _,
    Autowired,
    Component,
    EventService,
    GridOptionsWrapper,
    ToolPanelVisibleChangedEvent,
    IComponent,
    ISideBar,
    PostConstruct,
    RefSelector,
    SideBarDef,
    ToolPanelDef, Events
} from "ag-grid-community";
import { SideBarButtonClickedEvent, SideBarButtonsComp } from "./sideBarButtonsComp";
import { ToolPanelWrapper } from "./toolPanelWrapper";

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
        const sideBar: SideBarDef = this.gridOptionsWrapper.getSideBar();
        const sideBarExists = !!sideBar && !!sideBar.toolPanels;

        if (sideBarExists) {
            const toolPanelDefs = sideBar.toolPanels as ToolPanelDef[];
            this.sideBarButtonsComp.setToolPanelDefs(toolPanelDefs);
            this.setupToolPanels(toolPanelDefs);

            if (!sideBar.hiddenByDefault) {
                this.openToolPanel(sideBar.defaultToolPanel);
            }
        }

        const sideBarVisible = sideBarExists && !sideBar.hiddenByDefault;
        setTimeout(() => this.setDisplayed(sideBarVisible), 0);
    }

    private setupToolPanels(defs: ToolPanelDef[]): void {
        defs.forEach(def => {
            if (def.id == null) {
                console.warn(`ag-grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id`);
                return;
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
