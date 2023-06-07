var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Component, Events, ModuleNames, ModuleRegistry, PostConstruct, RefSelector, Autowired, ManagedFocusFeature, KeyCode } from "@ag-grid-community/core";
import { SideBarButtonsComp } from "./sideBarButtonsComp";
import { SideBarDefParser } from "./sideBarDefParser";
import { ToolPanelWrapper } from "./toolPanelWrapper";
export class SideBarComp extends Component {
    constructor() {
        super(SideBarComp.TEMPLATE);
        this.toolPanelWrappers = [];
    }
    postConstruct() {
        this.sideBarButtonsComp.addEventListener(SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED, this.onToolPanelButtonClicked.bind(this));
        this.setSideBarDef();
        this.addManagedPropertyListener('sideBar', () => {
            this.clearDownUi();
            this.setSideBarDef();
        });
        this.gridApi.registerSideBarComp(this);
        this.createManagedBean(new ManagedFocusFeature(this.getFocusableElement(), {
            onTabKeyDown: this.onTabKeyDown.bind(this),
            handleKeyDown: this.handleKeyDown.bind(this)
        }));
    }
    onTabKeyDown(e) {
        if (e.defaultPrevented) {
            return;
        }
        const { focusService, sideBarButtonsComp } = this;
        const eGui = this.getGui();
        const sideBarGui = sideBarButtonsComp.getGui();
        const eDocument = this.gridOptionsService.getDocument();
        const activeElement = eDocument.activeElement;
        const openPanel = eGui.querySelector('.ag-tool-panel-wrapper:not(.ag-hidden)');
        const target = e.target;
        if (!openPanel) {
            return;
        }
        if (sideBarGui.contains(activeElement)) {
            if (focusService.focusInto(openPanel, e.shiftKey)) {
                e.preventDefault();
            }
            return;
        }
        // only handle backwards focus to target the sideBar buttons
        if (!e.shiftKey) {
            return;
        }
        let nextEl = null;
        if (openPanel.contains(activeElement)) {
            nextEl = this.focusService.findNextFocusableElement(openPanel, undefined, true);
        }
        else if (focusService.isTargetUnderManagedComponent(openPanel, target) && e.shiftKey) {
            nextEl = this.focusService.findFocusableElementBeforeTabGuard(openPanel, target);
        }
        if (!nextEl) {
            nextEl = sideBarGui.querySelector('.ag-selected button');
        }
        if (nextEl) {
            e.preventDefault();
            nextEl.focus();
        }
    }
    handleKeyDown(e) {
        const eDocument = this.gridOptionsService.getDocument();
        if (!this.sideBarButtonsComp.getGui().contains(eDocument.activeElement)) {
            return;
        }
        const sideBarGui = this.sideBarButtonsComp.getGui();
        const buttons = Array.prototype.slice.call(sideBarGui.querySelectorAll('.ag-side-button'));
        const currentButton = eDocument.activeElement;
        const currentPos = buttons.findIndex(button => button.contains(currentButton));
        let nextPos = null;
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
        if (nextPos === null) {
            return;
        }
        const innerButton = buttons[nextPos].querySelector('button');
        if (innerButton) {
            innerButton.focus();
            e.preventDefault();
        }
    }
    onToolPanelButtonClicked(event) {
        const id = event.toolPanelId;
        const openedItem = this.openedItem();
        // if item was already open, we close it
        if (openedItem === id) {
            this.openToolPanel(undefined, 'sideBarButtonClicked'); // passing undefined closes
        }
        else {
            this.openToolPanel(id, 'sideBarButtonClicked');
        }
    }
    clearDownUi() {
        this.sideBarButtonsComp.clearButtons();
        this.destroyToolPanelWrappers();
    }
    setSideBarDef() {
        // initially hide side bar
        this.setDisplayed(false);
        const sideBarRaw = this.gridOptionsService.get('sideBar');
        this.sideBar = SideBarDefParser.parse(sideBarRaw);
        if (!!this.sideBar && !!this.sideBar.toolPanels) {
            const shouldDisplaySideBar = !this.sideBar.hiddenByDefault;
            this.setDisplayed(shouldDisplaySideBar);
            const toolPanelDefs = this.sideBar.toolPanels;
            this.createToolPanelsAndSideButtons(toolPanelDefs);
            this.setSideBarPosition(this.sideBar.position);
            if (!this.sideBar.hiddenByDefault) {
                this.openToolPanel(this.sideBar.defaultToolPanel, 'sideBarInitializing');
            }
        }
    }
    getDef() {
        return this.sideBar;
    }
    setSideBarPosition(position) {
        if (!position) {
            position = 'right';
        }
        const isLeft = position === 'left';
        const resizerSide = isLeft ? 'right' : 'left';
        this.addOrRemoveCssClass('ag-side-bar-left', isLeft);
        this.addOrRemoveCssClass('ag-side-bar-right', !isLeft);
        this.toolPanelWrappers.forEach(wrapper => {
            wrapper.setResizerSizerSide(resizerSide);
        });
        return this;
    }
    createToolPanelsAndSideButtons(defs) {
        for (const def of defs) {
            this.createToolPanelAndSideButton(def);
        }
    }
    validateDef(def) {
        if (def.id == null) {
            console.warn(`AG Grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id`);
            return false;
        }
        // helpers, in case user doesn't have the right module loaded
        if (def.toolPanel === 'agColumnsToolPanel') {
            const moduleMissing = !ModuleRegistry.assertRegistered(ModuleNames.ColumnsToolPanelModule, 'Column Tool Panel', this.context.getGridId());
            if (moduleMissing) {
                return false;
            }
        }
        if (def.toolPanel === 'agFiltersToolPanel') {
            const moduleMissing = !ModuleRegistry.assertRegistered(ModuleNames.FiltersToolPanelModule, 'Filters Tool Panel', this.context.getGridId());
            if (moduleMissing) {
                return false;
            }
        }
        return true;
    }
    createToolPanelAndSideButton(def) {
        if (!this.validateDef(def)) {
            return;
        }
        const button = this.sideBarButtonsComp.addButtonComp(def);
        const wrapper = this.getContext().createBean(new ToolPanelWrapper());
        wrapper.setToolPanelDef(def);
        wrapper.setDisplayed(false);
        const wrapperGui = wrapper.getGui();
        this.appendChild(wrapperGui);
        this.toolPanelWrappers.push(wrapper);
        _.setAriaControls(button.getButtonElement(), wrapperGui);
    }
    refresh() {
        this.toolPanelWrappers.forEach(wrapper => wrapper.refresh());
    }
    openToolPanel(key, source = 'api') {
        const currentlyOpenedKey = this.openedItem();
        if (currentlyOpenedKey === key) {
            return;
        }
        this.toolPanelWrappers.forEach(wrapper => {
            const show = key === wrapper.getToolPanelId();
            wrapper.setDisplayed(show);
        });
        const newlyOpenedKey = this.openedItem();
        const openToolPanelChanged = currentlyOpenedKey !== newlyOpenedKey;
        if (openToolPanelChanged) {
            this.sideBarButtonsComp.setActiveButton(key);
            this.raiseToolPanelVisibleEvent(key, currentlyOpenedKey !== null && currentlyOpenedKey !== void 0 ? currentlyOpenedKey : undefined, source);
        }
    }
    getToolPanelInstance(key) {
        const toolPanelWrapper = this.toolPanelWrappers.filter(toolPanel => toolPanel.getToolPanelId() === key)[0];
        if (!toolPanelWrapper) {
            console.warn(`AG Grid: unable to lookup Tool Panel as invalid key supplied: ${key}`);
            return;
        }
        return toolPanelWrapper.getToolPanelInstance();
    }
    raiseToolPanelVisibleEvent(key, previousKey, source) {
        const switchingToolPanel = !!key && !!previousKey;
        if (previousKey) {
            const event = {
                type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
                source,
                key: previousKey,
                visible: false,
                switchingToolPanel,
            };
            this.eventService.dispatchEvent(event);
        }
        if (key) {
            const event = {
                type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
                source,
                key,
                visible: true,
                switchingToolPanel,
            };
            this.eventService.dispatchEvent(event);
        }
    }
    close(source = 'api') {
        this.openToolPanel(undefined, source);
    }
    isToolPanelShowing() {
        return !!this.openedItem();
    }
    openedItem() {
        let activeToolPanel = null;
        this.toolPanelWrappers.forEach(wrapper => {
            if (wrapper.isDisplayed()) {
                activeToolPanel = wrapper.getToolPanelId();
            }
        });
        return activeToolPanel;
    }
    destroyToolPanelWrappers() {
        this.toolPanelWrappers.forEach(wrapper => {
            _.removeFromParent(wrapper.getGui());
            this.destroyBean(wrapper);
        });
        this.toolPanelWrappers.length = 0;
    }
    destroy() {
        this.destroyToolPanelWrappers();
        super.destroy();
    }
}
SideBarComp.TEMPLATE = `<div class="ag-side-bar ag-unselectable">
            <ag-side-bar-buttons ref="sideBarButtons"></ag-side-bar-buttons>
        </div>`;
__decorate([
    Autowired('gridApi')
], SideBarComp.prototype, "gridApi", void 0);
__decorate([
    Autowired('focusService')
], SideBarComp.prototype, "focusService", void 0);
__decorate([
    RefSelector('sideBarButtons')
], SideBarComp.prototype, "sideBarButtonsComp", void 0);
__decorate([
    PostConstruct
], SideBarComp.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZUJhckNvbXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2lkZUJhci9zaWRlQmFyQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFNBQVMsRUFDVCxNQUFNLEVBR04sV0FBVyxFQUNYLGNBQWMsRUFDZCxhQUFhLEVBQ2IsV0FBVyxFQUtYLFNBQVMsRUFDVCxtQkFBbUIsRUFFbkIsT0FBTyxFQUVWLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUE2QixrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3JGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELE1BQU0sT0FBTyxXQUFZLFNBQVEsU0FBUztJQWN0QztRQUNJLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFUeEIsc0JBQWlCLEdBQXVCLEVBQUUsQ0FBQztJQVVuRCxDQUFDO0lBR08sYUFBYTtRQUNqQixJQUFJLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsMEJBQTBCLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtZQUM1QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxtQkFB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