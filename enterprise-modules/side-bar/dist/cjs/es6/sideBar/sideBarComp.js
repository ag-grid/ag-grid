"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const sideBarButtonsComp_1 = require("./sideBarButtonsComp");
const toolPanelWrapper_1 = require("./toolPanelWrapper");
class SideBarComp extends core_1.Component {
    constructor() {
        super(SideBarComp.TEMPLATE);
        this.toolPanelWrappers = [];
    }
    postConstruct() {
        this.sideBarButtonsComp.addEventListener(sideBarButtonsComp_1.SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED, this.onToolPanelButtonClicked.bind(this));
        this.setSideBarDef();
        this.gridOptionsWrapper.addEventListener('sideBar', () => {
            this.clearDownUi();
            this.setSideBarDef();
        });
        this.gridApi.registerSideBarComp(this);
        this.createManagedBean(new core_1.ManagedFocusFeature(this.getFocusableElement(), {
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
        const eDocument = this.gridOptionsWrapper.getDocument();
        const activeElement = eDocument.activeElement;
        const openPanel = eGui.querySelector('.ag-tool-panel-wrapper:not(.ag-hidden)');
        if (!openPanel) {
            return;
        }
        if (sideBarGui.contains(activeElement)) {
            if (focusService.focusInto(openPanel, e.shiftKey)) {
                e.preventDefault();
            }
        }
        else {
            if (!focusService.isFocusUnderManagedComponent(openPanel) && e.shiftKey) {
                const firstFocusableEl = focusService.findFocusableElements(openPanel)[0];
                const eDocument = this.gridOptionsWrapper.getDocument();
                if (eDocument.activeElement === firstFocusableEl) {
                    const selectedButton = sideBarGui.querySelector('.ag-selected button');
                    if (selectedButton) {
                        e.preventDefault();
                        selectedButton.focus();
                    }
                }
            }
        }
    }
    handleKeyDown(e) {
        const eDocument = this.gridOptionsWrapper.getDocument();
        if (!this.sideBarButtonsComp.getGui().contains(eDocument.activeElement)) {
            return;
        }
        const sideBarGui = this.sideBarButtonsComp.getGui();
        const buttons = Array.prototype.slice.call(sideBarGui.querySelectorAll('.ag-side-button'));
        const currentButton = eDocument.activeElement;
        const currentPos = buttons.findIndex(button => button.contains(currentButton));
        let nextPos = null;
        switch (e.key) {
            case core_1.KeyCode.LEFT:
            case core_1.KeyCode.UP:
                nextPos = Math.max(0, currentPos - 1);
                break;
            case core_1.KeyCode.RIGHT:
            case core_1.KeyCode.DOWN:
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
            this.openToolPanel(undefined); // passing undefined closes
        }
        else {
            this.openToolPanel(id);
        }
    }
    clearDownUi() {
        this.sideBarButtonsComp.clearButtons();
        this.destroyToolPanelWrappers();
    }
    setSideBarDef() {
        // initially hide side bar
        this.setDisplayed(false);
        const sideBar = this.gridOptionsWrapper.getSideBar();
        const sideBarExists = !!sideBar && !!sideBar.toolPanels;
        if (!sideBarExists) {
            return;
        }
        const shouldDisplaySideBar = sideBarExists && !sideBar.hiddenByDefault;
        this.setDisplayed(shouldDisplaySideBar);
        const toolPanelDefs = sideBar.toolPanels;
        this.sideBarButtonsComp.setToolPanelDefs(toolPanelDefs);
        this.setupToolPanels(toolPanelDefs);
        this.setSideBarPosition(sideBar.position);
        if (!sideBar.hiddenByDefault) {
            this.openToolPanel(sideBar.defaultToolPanel);
        }
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
    setupToolPanels(defs) {
        defs.forEach(def => {
            if (def.id == null) {
                console.warn(`AG Grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id`);
                return;
            }
            // helpers, in case user doesn't have the right module loaded
            if (def.toolPanel === 'agColumnsToolPanel') {
                const moduleMissing = !core_1.ModuleRegistry.assertRegistered(core_1.ModuleNames.ColumnToolPanelModule, 'Column Tool Panel');
                if (moduleMissing) {
                    return;
                }
            }
            if (def.toolPanel === 'agFiltersToolPanel') {
                const moduleMissing = !core_1.ModuleRegistry.assertRegistered(core_1.ModuleNames.FiltersToolPanelModule, 'Filters Tool Panel');
                if (moduleMissing) {
                    return;
                }
            }
            const wrapper = new toolPanelWrapper_1.ToolPanelWrapper();
            this.getContext().createBean(wrapper);
            wrapper.setToolPanelDef(def);
            wrapper.setDisplayed(false);
            this.getGui().appendChild(wrapper.getGui());
            this.toolPanelWrappers.push(wrapper);
        });
    }
    refresh() {
        this.toolPanelWrappers.forEach(wrapper => wrapper.refresh());
    }
    openToolPanel(key) {
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
            this.raiseToolPanelVisibleEvent(key);
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
    raiseToolPanelVisibleEvent(key) {
        const event = {
            type: core_1.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
            source: key
        };
        this.eventService.dispatchEvent(event);
    }
    close() {
        this.openToolPanel(undefined);
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
            core_1._.removeFromParent(wrapper.getGui());
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
    core_1.Autowired('gridApi')
], SideBarComp.prototype, "gridApi", void 0);
__decorate([
    core_1.Autowired('focusService')
], SideBarComp.prototype, "focusService", void 0);
__decorate([
    core_1.RefSelector('sideBarButtons')
], SideBarComp.prototype, "sideBarButtonsComp", void 0);
__decorate([
    core_1.PostConstruct
], SideBarComp.prototype, "postConstruct", null);
exports.SideBarComp = SideBarComp;
