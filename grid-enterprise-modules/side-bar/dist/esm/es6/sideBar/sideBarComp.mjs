var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Component, Events, ModuleNames, ModuleRegistry, PostConstruct, RefSelector, Autowired, ManagedFocusFeature, KeyCode } from "@ag-grid-community/core";
import { SideBarButtonsComp } from "./sideBarButtonsComp.mjs";
import { SideBarDefParser } from "./sideBarDefParser.mjs";
import { ToolPanelWrapper } from "./toolPanelWrapper.mjs";
export class SideBarComp extends Component {
    constructor() {
        super(SideBarComp.TEMPLATE);
        this.toolPanelWrappers = [];
    }
    postConstruct() {
        var _a;
        this.sideBarButtonsComp.addEventListener(SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED, this.onToolPanelButtonClicked.bind(this));
        const { sideBar: sideBarState } = (_a = this.gridOptionsService.get('initialState')) !== null && _a !== void 0 ? _a : {};
        this.setSideBarDef(sideBarState);
        this.addManagedPropertyListener('sideBar', () => {
            this.clearDownUi();
            // don't re-assign initial state
            this.setSideBarDef();
        });
        this.sideBarService.registerSideBarComp(this);
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
    setSideBarDef(sideBarState) {
        // initially hide side bar
        this.setDisplayed(false);
        const sideBarRaw = this.gridOptionsService.get('sideBar');
        this.sideBar = SideBarDefParser.parse(sideBarRaw);
        if (!!this.sideBar && !!this.sideBar.toolPanels) {
            const toolPanelDefs = this.sideBar.toolPanels;
            this.createToolPanelsAndSideButtons(toolPanelDefs, sideBarState);
            if (!this.toolPanelWrappers.length) {
                return;
            }
            const shouldDisplaySideBar = sideBarState ? sideBarState.visible : !this.sideBar.hiddenByDefault;
            this.setDisplayed(shouldDisplaySideBar);
            this.setSideBarPosition(sideBarState ? sideBarState.position : this.sideBar.position);
            if (shouldDisplaySideBar) {
                if (sideBarState) {
                    const { openToolPanel } = sideBarState;
                    if (openToolPanel) {
                        this.openToolPanel(openToolPanel, 'sideBarInitializing');
                    }
                }
                else {
                    this.openToolPanel(this.sideBar.defaultToolPanel, 'sideBarInitializing');
                }
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
        this.position = position;
        const isLeft = position === 'left';
        const resizerSide = isLeft ? 'right' : 'left';
        this.addOrRemoveCssClass('ag-side-bar-left', isLeft);
        this.addOrRemoveCssClass('ag-side-bar-right', !isLeft);
        this.toolPanelWrappers.forEach(wrapper => {
            wrapper.setResizerSizerSide(resizerSide);
        });
        this.eventService.dispatchEvent({ type: Events.EVENT_SIDE_BAR_UPDATED });
        return this;
    }
    setDisplayed(displayed, options) {
        super.setDisplayed(displayed, options);
        this.eventService.dispatchEvent({ type: Events.EVENT_SIDE_BAR_UPDATED });
    }
    getState() {
        const toolPanels = {};
        this.toolPanelWrappers.forEach(wrapper => {
            var _a, _b;
            toolPanels[wrapper.getToolPanelId()] = (_b = (_a = wrapper.getToolPanelInstance()).getState) === null || _b === void 0 ? void 0 : _b.call(_a);
        });
        return {
            visible: this.isDisplayed(),
            position: this.position,
            openToolPanel: this.openedItem(),
            toolPanels
        };
    }
    createToolPanelsAndSideButtons(defs, sideBarState) {
        var _a;
        for (const def of defs) {
            this.createToolPanelAndSideButton(def, (_a = sideBarState === null || sideBarState === void 0 ? void 0 : sideBarState.toolPanels) === null || _a === void 0 ? void 0 : _a[def.id]);
        }
    }
    validateDef(def) {
        if (def.id == null) {
            console.warn(`AG Grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id`);
            return false;
        }
        // helpers, in case user doesn't have the right module loaded
        if (def.toolPanel === 'agColumnsToolPanel') {
            const moduleMissing = !ModuleRegistry.__assertRegistered(ModuleNames.ColumnsToolPanelModule, 'Column Tool Panel', this.context.getGridId());
            if (moduleMissing) {
                return false;
            }
        }
        if (def.toolPanel === 'agFiltersToolPanel') {
            const moduleMissing = !ModuleRegistry.__assertRegistered(ModuleNames.FiltersToolPanelModule, 'Filters Tool Panel', this.context.getGridId());
            if (moduleMissing) {
                return false;
            }
            if (this.filterManager.isAdvancedFilterEnabled()) {
                _.warnOnce('Advanced Filter does not work with Filters Tool Panel. Filters Tool Panel has been disabled.');
                return false;
            }
        }
        return true;
    }
    createToolPanelAndSideButton(def, initialState) {
        if (!this.validateDef(def)) {
            return;
        }
        const button = this.sideBarButtonsComp.addButtonComp(def);
        const wrapper = this.getContext().createBean(new ToolPanelWrapper());
        wrapper.setToolPanelDef(def, {
            initialState,
            onStateUpdated: () => this.eventService.dispatchEvent({ type: Events.EVENT_SIDE_BAR_UPDATED })
        });
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
    Autowired('focusService')
], SideBarComp.prototype, "focusService", void 0);
__decorate([
    Autowired('filterManager')
], SideBarComp.prototype, "filterManager", void 0);
__decorate([
    Autowired('sideBarService')
], SideBarComp.prototype, "sideBarService", void 0);
__decorate([
    RefSelector('sideBarButtons')
], SideBarComp.prototype, "sideBarButtonsComp", void 0);
__decorate([
    PostConstruct
], SideBarComp.prototype, "postConstruct", null);
