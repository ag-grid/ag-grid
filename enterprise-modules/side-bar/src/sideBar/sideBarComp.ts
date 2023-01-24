import {
    _,
    Component,
    Events,
    ISideBar,
    IToolPanel,
    ModuleNames,
    ModuleRegistry,
    PostConstruct,
    RefSelector,
    SideBarDef,
    ToolPanelDef,
    GridApi,
    ToolPanelVisibleChangedEvent,
    Autowired,
    ManagedFocusFeature,
    FocusService,
    KeyCode,
    WithoutGridCommon
} from "@ag-grid-community/core";
import { SideBarButtonClickedEvent, SideBarButtonsComp } from "./sideBarButtonsComp";
import { SideBarDefParser } from "./sideBarDefParser";
import { ToolPanelWrapper } from "./toolPanelWrapper";

export class SideBarComp extends Component implements ISideBar {

    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('focusService') private focusService: FocusService;
    @RefSelector('sideBarButtons') private sideBarButtonsComp: SideBarButtonsComp;

    private toolPanelWrappers: ToolPanelWrapper[] = [];
    private sideBar: SideBarDef | undefined;

    private static readonly TEMPLATE = /* html */
        `<div class="ag-side-bar ag-unselectable">
            <ag-side-bar-buttons ref="sideBarButtons"></ag-side-bar-buttons>
        </div>`;

    constructor() {
        super(SideBarComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.sideBarButtonsComp.addEventListener(SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED, this.onToolPanelButtonClicked.bind(this));
        this.setSideBarDef();

        this.addManagedPropertyListener('sideBar', () => {
            this.clearDownUi();
            this.setSideBarDef();
        });

        this.gridApi.registerSideBarComp(this);
        this.createManagedBean(new ManagedFocusFeature(
            this.getFocusableElement(),
            {
                onTabKeyDown: this.onTabKeyDown.bind(this),
                handleKeyDown: this.handleKeyDown.bind(this)
            }
        ));
    }

    protected onTabKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) { return; }

        const { focusService, sideBarButtonsComp } = this;
        const eGui = this.getGui();
        const sideBarGui = sideBarButtonsComp.getGui();
        const eDocument = this.gridOptionsService.getDocument();
        const activeElement = eDocument.activeElement as HTMLElement;
        const openPanel = eGui.querySelector('.ag-tool-panel-wrapper:not(.ag-hidden)') as HTMLElement;

        if (!openPanel) { return; }

        if (sideBarGui.contains(activeElement)) {
            if (focusService.focusInto(openPanel, e.shiftKey)) {
                e.preventDefault();
            }
        } else {
            if (!focusService.isFocusUnderManagedComponent(openPanel) && e.shiftKey) {
                const firstFocusableEl = focusService.findFocusableElements(openPanel)[0];
                const eDocument = this.gridOptionsService.getDocument();
                if (eDocument.activeElement === firstFocusableEl) {
                    const selectedButton = sideBarGui.querySelector('.ag-selected button') as HTMLElement;

                    if (selectedButton) {
                        e.preventDefault();
                        selectedButton.focus();

                    }
                }
            }
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        const eDocument = this.gridOptionsService.getDocument();
        if (!this.sideBarButtonsComp.getGui().contains(eDocument.activeElement)) { return; }
        const sideBarGui = this.sideBarButtonsComp.getGui();
        const buttons: HTMLElement[] = Array.prototype.slice.call(sideBarGui.querySelectorAll('.ag-side-button'));
        const currentButton = eDocument.activeElement;
        const currentPos = buttons.findIndex(button => button.contains(currentButton));
        let nextPos: number | null = null;

        switch (e.key) {
            case KeyCode.LEFT:
            case KeyCode.UP:
                nextPos = Math.max(0, currentPos - 1);
                break;
            case KeyCode.RIGHT:
            case KeyCode.DOWN:
                nextPos = Math.min(currentPos + 1, buttons.length - 1);
                break;
        }

        if (nextPos === null) { return; }

        const innerButton = buttons[nextPos].querySelector('button');

        if (innerButton) {
            innerButton.focus();
            e.preventDefault();
        }
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

        const sideBarRaw = this.gridOptionsService.get('sideBar');
        this.sideBar = SideBarDefParser.parse(sideBarRaw);

        if (!!this.sideBar && !!this.sideBar.toolPanels) {
            const shouldDisplaySideBar = !this.sideBar.hiddenByDefault;
            this.setDisplayed(shouldDisplaySideBar);

            const toolPanelDefs = this.sideBar.toolPanels as ToolPanelDef[];
            this.sideBarButtonsComp.setToolPanelDefs(toolPanelDefs);
            this.setupToolPanels(toolPanelDefs);
            this.setSideBarPosition(this.sideBar.position);

            if (!this.sideBar.hiddenByDefault) {
                this.openToolPanel(this.sideBar.defaultToolPanel);
            }
        }
    }

    public getDef() {
        return this.sideBar;
    }

    public setSideBarPosition(position?: 'left' | 'right'): this {
        if (!position) { position = 'right'; }

        const isLeft =  position === 'left';
        const resizerSide = isLeft ? 'right' : 'left';

        this.addOrRemoveCssClass('ag-side-bar-left', isLeft);
        this.addOrRemoveCssClass('ag-side-bar-right', !isLeft);

        this.toolPanelWrappers.forEach(wrapper => {
            wrapper.setResizerSizerSide(resizerSide);
        });

        return this;
    }

    private setupToolPanels(defs: ToolPanelDef[]): void {
        defs.forEach(def => {
            if (def.id == null) {
                console.warn(`AG Grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id`);
                return;
            }

            // helpers, in case user doesn't have the right module loaded
            if (def.toolPanel === 'agColumnsToolPanel') {
                const moduleMissing =
                    !ModuleRegistry.assertRegistered(ModuleNames.ColumnToolPanelModule, 'Column Tool Panel');
                if (moduleMissing) { return; }
            }

            if (def.toolPanel === 'agFiltersToolPanel') {
                const moduleMissing =
                    !ModuleRegistry.assertRegistered(ModuleNames.FiltersToolPanelModule, 'Filters Tool Panel');
                if (moduleMissing) { return; }
            }

            const wrapper = new ToolPanelWrapper();
            this.getContext().createBean(wrapper);
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
            this.raiseToolPanelVisibleEvent(key, currentlyOpenedKey ?? undefined);
        }
    }

    public getToolPanelInstance(key: string): IToolPanel | undefined {
        const toolPanelWrapper = this.toolPanelWrappers.filter(toolPanel => toolPanel.getToolPanelId() === key)[0];

        if (!toolPanelWrapper) {
            console.warn(`AG Grid: unable to lookup Tool Panel as invalid key supplied: ${key}`);
            return;
        }

        return toolPanelWrapper.getToolPanelInstance();
    }

    private raiseToolPanelVisibleEvent(key: string | undefined, previousKey: string | undefined): void {
        const event: WithoutGridCommon<ToolPanelVisibleChangedEvent> = {
            type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
            source: key,
            key,
            previousKey
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

    private destroyToolPanelWrappers(): void {
        this.toolPanelWrappers.forEach(wrapper => {
            _.removeFromParent(wrapper.getGui());
            this.destroyBean(wrapper);
        });
        this.toolPanelWrappers.length = 0;
    }

    protected destroy(): void {
        this.destroyToolPanelWrappers();
        super.destroy();
    }
}
