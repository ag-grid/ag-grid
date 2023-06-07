/**
          * @ag-grid-enterprise/side-bar - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
import { Autowired, PostConstruct, Component, Events, RefSelector, _, PreDestroy, KeyCode, ManagedFocusFeature, ModuleRegistry, ModuleNames, Bean, BeanStub, ProvidedColumnGroup } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class HorizontalResizeComp extends Component {
    constructor() {
        super(/* html */ `<div class="ag-tool-panel-horizontal-resize"></div>`);
        this.minWidth = 100;
        this.maxWidth = null;
    }
    setElementToResize(elementToResize) {
        this.elementToResize = elementToResize;
    }
    postConstruct() {
        const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.getGui(),
            dragStartPixels: 1,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this),
            onResizeEnd: this.onResizeEnd.bind(this)
        });
        this.addDestroyFunc(finishedWithResizeFunc);
        this.setInverted(this.gridOptionsService.is('enableRtl'));
    }
    dispatchResizeEvent(start, end, width) {
        const event = {
            type: Events.EVENT_TOOL_PANEL_SIZE_CHANGED,
            width: width,
            started: start,
            ended: end,
        };
        this.eventService.dispatchEvent(event);
    }
    onResizeStart() {
        this.startingWidth = this.elementToResize.offsetWidth;
        this.dispatchResizeEvent(true, false, this.startingWidth);
    }
    onResizeEnd(delta) {
        return this.onResizing(delta, true);
    }
    onResizing(delta, isEnd = false) {
        const direction = this.inverted ? -1 : 1;
        let newWidth = Math.max(this.minWidth, Math.floor(this.startingWidth - (delta * direction)));
        if (this.maxWidth != null) {
            newWidth = Math.min(this.maxWidth, newWidth);
        }
        this.elementToResize.style.width = `${newWidth}px`;
        this.dispatchResizeEvent(false, isEnd, newWidth);
    }
    setInverted(inverted) {
        this.inverted = inverted;
    }
    setMaxWidth(value) {
        this.maxWidth = value;
    }
    setMinWidth(value) {
        if (value != null) {
            this.minWidth = value;
        }
        else {
            this.minWidth = 100;
        }
    }
}
__decorate$5([
    Autowired('horizontalResizeService')
], HorizontalResizeComp.prototype, "horizontalResizeService", void 0);
__decorate$5([
    PostConstruct
], HorizontalResizeComp.prototype, "postConstruct", null);

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class SideBarButtonComp extends Component {
    constructor(toolPanelDef) {
        super();
        this.toolPanelDef = toolPanelDef;
    }
    getToolPanelId() {
        return this.toolPanelDef.id;
    }
    postConstruct() {
        const template = this.createTemplate();
        this.setTemplate(template);
        this.setLabel();
        this.setIcon();
        this.addManagedListener(this.eToggleButton, 'click', this.onButtonPressed.bind(this));
        this.eToggleButton.setAttribute('id', `ag-${this.getCompId()}-button`);
    }
    createTemplate() {
        const res = /* html */ `<div class="ag-side-button" role="presentation">
                <button type="button" ref="eToggleButton" tabindex="-1" role="tab" aria-expanded="false" class="ag-button ag-side-button-button">
                    <div ref="eIconWrapper" class="ag-side-button-icon-wrapper" aria-hidden="true"></div>
                    <span ref ="eLabel" class="ag-side-button-label"></span>
                </button>
            </div>`;
        return res;
    }
    setLabel() {
        const translate = this.localeService.getLocaleTextFunc();
        const def = this.toolPanelDef;
        const label = translate(def.labelKey, def.labelDefault);
        this.eLabel.innerText = label;
    }
    setIcon() {
        this.eIconWrapper.insertAdjacentElement('afterbegin', _.createIconNoSpan(this.toolPanelDef.iconKey, this.gridOptionsService));
    }
    onButtonPressed() {
        this.dispatchEvent({ type: SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED });
    }
    setSelected(selected) {
        this.addOrRemoveCssClass('ag-selected', selected);
        _.setAriaExpanded(this.eToggleButton, selected);
    }
    getButtonElement() {
        return this.eToggleButton;
    }
}
SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED = 'toggleButtonClicked';
__decorate$4([
    RefSelector('eToggleButton')
], SideBarButtonComp.prototype, "eToggleButton", void 0);
__decorate$4([
    RefSelector('eIconWrapper')
], SideBarButtonComp.prototype, "eIconWrapper", void 0);
__decorate$4([
    RefSelector('eLabel')
], SideBarButtonComp.prototype, "eLabel", void 0);
__decorate$4([
    PostConstruct
], SideBarButtonComp.prototype, "postConstruct", null);

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class SideBarButtonsComp extends Component {
    constructor() {
        super(SideBarButtonsComp.TEMPLATE);
        this.buttonComps = [];
    }
    postConstruct() {
        this.addManagedListener(this.getFocusableElement(), 'keydown', this.handleKeyDown.bind(this));
    }
    handleKeyDown(e) {
        if (e.key !== KeyCode.TAB || !e.shiftKey) {
            return;
        }
        const lastColumn = _.last(this.columnModel.getAllDisplayedColumns());
        if (this.focusService.focusGridView(lastColumn, true)) {
            e.preventDefault();
        }
    }
    setActiveButton(id) {
        this.buttonComps.forEach(comp => {
            comp.setSelected(id === comp.getToolPanelId());
        });
    }
    addButtonComp(def) {
        const buttonComp = this.createBean(new SideBarButtonComp(def));
        this.buttonComps.push(buttonComp);
        this.appendChild(buttonComp);
        buttonComp.addEventListener(SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED, () => {
            this.dispatchEvent({
                type: SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED,
                toolPanelId: def.id
            });
        });
        return buttonComp;
    }
    clearButtons() {
        this.buttonComps = this.destroyBeans(this.buttonComps);
        _.clearElement(this.getGui());
    }
}
SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED = 'sideBarButtonClicked';
SideBarButtonsComp.TEMPLATE = `<div class="ag-side-buttons" role="tablist"></div>`;
__decorate$3([
    Autowired('focusService')
], SideBarButtonsComp.prototype, "focusService", void 0);
__decorate$3([
    Autowired('columnModel')
], SideBarButtonsComp.prototype, "columnModel", void 0);
__decorate$3([
    PostConstruct
], SideBarButtonsComp.prototype, "postConstruct", null);
__decorate$3([
    PreDestroy
], SideBarButtonsComp.prototype, "clearButtons", null);

class SideBarDefParser {
    static parse(toParse) {
        if (!toParse) {
            return undefined;
        }
        if (toParse === true) {
            return {
                toolPanels: [
                    SideBarDefParser.DEFAULT_COLUMN_COMP,
                    SideBarDefParser.DEFAULT_FILTER_COMP,
                ],
                defaultToolPanel: 'columns'
            };
        }
        if (typeof toParse === 'string') {
            return SideBarDefParser.parse([toParse]);
        }
        if (Array.isArray(toParse)) {
            const comps = [];
            toParse.forEach(key => {
                const lookupResult = SideBarDefParser.DEFAULT_BY_KEY[key];
                if (!lookupResult) {
                    console.warn(`AG Grid: the key ${key} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(SideBarDefParser.DEFAULT_BY_KEY).join(',')}`);
                    return;
                }
                comps.push(lookupResult);
            });
            if (comps.length === 0) {
                return undefined;
            }
            return {
                toolPanels: comps,
                defaultToolPanel: comps[0].id
            };
        }
        const result = {
            toolPanels: SideBarDefParser.parseComponents(toParse.toolPanels),
            defaultToolPanel: toParse.defaultToolPanel,
            hiddenByDefault: toParse.hiddenByDefault,
            position: toParse.position
        };
        return result;
    }
    static parseComponents(from) {
        const result = [];
        if (!from) {
            return result;
        }
        from.forEach((it) => {
            let toAdd = null;
            if (typeof it === 'string') {
                const lookupResult = SideBarDefParser.DEFAULT_BY_KEY[it];
                if (!lookupResult) {
                    console.warn(`AG Grid: the key ${it} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(SideBarDefParser.DEFAULT_BY_KEY).join(',')}`);
                    return;
                }
                toAdd = lookupResult;
            }
            else {
                toAdd = it;
            }
            result.push(toAdd);
        });
        return result;
    }
}
SideBarDefParser.DEFAULT_COLUMN_COMP = {
    id: 'columns',
    labelDefault: 'Columns',
    labelKey: 'columns',
    iconKey: 'columns',
    toolPanel: 'agColumnsToolPanel',
};
SideBarDefParser.DEFAULT_FILTER_COMP = {
    id: 'filters',
    labelDefault: 'Filters',
    labelKey: 'filters',
    iconKey: 'filter',
    toolPanel: 'agFiltersToolPanel',
};
SideBarDefParser.DEFAULT_BY_KEY = {
    columns: SideBarDefParser.DEFAULT_COLUMN_COMP,
    filters: SideBarDefParser.DEFAULT_FILTER_COMP
};

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ToolPanelWrapper extends Component {
    constructor() {
        super(ToolPanelWrapper.TEMPLATE);
    }
    setupResize() {
        const eGui = this.getGui();
        const resizeBar = this.resizeBar = this.createManagedBean(new HorizontalResizeComp());
        eGui.setAttribute('id', `ag-${this.getCompId()}`);
        resizeBar.setElementToResize(eGui);
        this.appendChild(resizeBar);
    }
    getToolPanelId() {
        return this.toolPanelId;
    }
    setToolPanelDef(toolPanelDef) {
        const { id, minWidth, maxWidth, width } = toolPanelDef;
        this.toolPanelId = id;
        this.width = width;
        const params = {};
        const compDetails = this.userComponentFactory.getToolPanelCompDetails(toolPanelDef, params);
        const componentPromise = compDetails.newAgStackInstance();
        if (componentPromise == null) {
            console.warn(`AG Grid: error processing tool panel component ${id}. You need to specify 'toolPanel'`);
            return;
        }
        componentPromise.then(this.setToolPanelComponent.bind(this));
        if (minWidth != null) {
            this.resizeBar.setMinWidth(minWidth);
        }
        if (maxWidth != null) {
            this.resizeBar.setMaxWidth(maxWidth);
        }
    }
    setToolPanelComponent(compInstance) {
        this.toolPanelCompInstance = compInstance;
        this.appendChild(compInstance.getGui());
        this.addDestroyFunc(() => {
            this.destroyBean(compInstance);
        });
        if (this.width) {
            this.getGui().style.width = `${this.width}px`;
        }
    }
    getToolPanelInstance() {
        return this.toolPanelCompInstance;
    }
    setResizerSizerSide(side) {
        const isRtl = this.gridOptionsService.is('enableRtl');
        const isLeft = side === 'left';
        const inverted = isRtl ? isLeft : !isLeft;
        this.resizeBar.setInverted(inverted);
    }
    refresh() {
        this.toolPanelCompInstance.refresh();
    }
}
ToolPanelWrapper.TEMPLATE = `<div class="ag-tool-panel-wrapper" role="tabpanel"/>`;
__decorate$2([
    Autowired("userComponentFactory")
], ToolPanelWrapper.prototype, "userComponentFactory", void 0);
__decorate$2([
    PostConstruct
], ToolPanelWrapper.prototype, "setupResize", null);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class SideBarComp extends Component {
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
__decorate$1([
    Autowired('gridApi')
], SideBarComp.prototype, "gridApi", void 0);
__decorate$1([
    Autowired('focusService')
], SideBarComp.prototype, "focusService", void 0);
__decorate$1([
    RefSelector('sideBarButtons')
], SideBarComp.prototype, "sideBarButtonsComp", void 0);
__decorate$1([
    PostConstruct
], SideBarComp.prototype, "postConstruct", null);

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let ToolPanelColDefService = class ToolPanelColDefService extends BeanStub {
    constructor() {
        super(...arguments);
        this.isColGroupDef = (colDef) => colDef && typeof colDef.children !== 'undefined';
        this.getId = (colDef) => {
            return this.isColGroupDef(colDef) ? colDef.groupId : colDef.colId;
        };
    }
    createColumnTree(colDefs) {
        const invalidColIds = [];
        const createDummyColGroup = (abstractColDef, depth) => {
            if (this.isColGroupDef(abstractColDef)) {
                // creating 'dummy' group which is not associated with grid column group
                const groupDef = abstractColDef;
                const groupId = (typeof groupDef.groupId !== 'undefined') ? groupDef.groupId : groupDef.headerName;
                const group = new ProvidedColumnGroup(groupDef, groupId, false, depth);
                const children = [];
                groupDef.children.forEach(def => {
                    const child = createDummyColGroup(def, depth + 1);
                    // check column exists in case invalid colDef is supplied for primary column
                    if (child) {
                        children.push(child);
                    }
                });
                group.setChildren(children);
                return group;
            }
            else {
                const colDef = abstractColDef;
                const key = colDef.colId ? colDef.colId : colDef.field;
                const column = this.columnModel.getPrimaryColumn(key);
                if (!column) {
                    invalidColIds.push(colDef);
                }
                return column;
            }
        };
        const mappedResults = [];
        colDefs.forEach(colDef => {
            const result = createDummyColGroup(colDef, 0);
            if (result) {
                // only return correctly mapped colDef results
                mappedResults.push(result);
            }
        });
        if (invalidColIds.length > 0) {
            console.warn('AG Grid: unable to find grid columns for the supplied colDef(s):', invalidColIds);
        }
        return mappedResults;
    }
    syncLayoutWithGrid(syncLayoutCallback) {
        // extract ordered list of leaf path trees (column group hierarchy for each individual leaf column)
        const leafPathTrees = this.getLeafPathTrees();
        // merge leaf path tree taking split column groups into account
        const mergedColumnTrees = this.mergeLeafPathTrees(leafPathTrees);
        // sync layout with merged column trees
        syncLayoutCallback(mergedColumnTrees);
    }
    getLeafPathTrees() {
        // leaf tree paths are obtained by walking up the tree starting at a column until we reach the top level group.
        const getLeafPathTree = (node, childDef) => {
            let leafPathTree;
            // build up tree in reverse order
            if (node instanceof ProvidedColumnGroup) {
                if (node.isPadding()) {
                    // skip over padding groups
                    leafPathTree = childDef;
                }
                else {
                    const groupDef = Object.assign({}, node.getColGroupDef());
                    // ensure group contains groupId
                    groupDef.groupId = node.getGroupId();
                    groupDef.children = [childDef];
                    leafPathTree = groupDef;
                }
            }
            else {
                const colDef = Object.assign({}, node.getColDef());
                // ensure col contains colId
                colDef.colId = node.getColId();
                leafPathTree = colDef;
            }
            // walk tree
            const parent = node.getOriginalParent();
            if (parent) {
                // keep walking up the tree until we reach the root
                return getLeafPathTree(parent, leafPathTree);
            }
            else {
                // we have reached the root - exit with resulting leaf path tree
                return leafPathTree;
            }
        };
        // obtain a sorted list of all grid columns
        const allGridColumns = this.columnModel.getAllGridColumns();
        // only primary columns and non row group columns should appear in the tool panel
        const allPrimaryGridColumns = allGridColumns.filter(column => {
            const colDef = column.getColDef();
            return column.isPrimary() && !colDef.showRowGroup;
        });
        // construct a leaf path tree for each column
        return allPrimaryGridColumns.map(col => getLeafPathTree(col, col.getColDef()));
    }
    mergeLeafPathTrees(leafPathTrees) {
        const matchingRootGroupIds = (pathA, pathB) => {
            const bothPathsAreGroups = this.isColGroupDef(pathA) && this.isColGroupDef(pathB);
            return bothPathsAreGroups && this.getId(pathA) === this.getId(pathB);
        };
        const mergeTrees = (treeA, treeB) => {
            if (!this.isColGroupDef(treeB)) {
                return treeA;
            }
            const mergeResult = treeA;
            const groupToMerge = treeB;
            if (groupToMerge.children && groupToMerge.groupId) {
                const added = this.addChildrenToGroup(mergeResult, groupToMerge.groupId, groupToMerge.children[0]);
                if (added) {
                    return mergeResult;
                }
            }
            groupToMerge.children.forEach(child => mergeTrees(mergeResult, child));
            return mergeResult;
        };
        // we can't just merge the leaf path trees as groups can be split apart - instead only merge if leaf
        // path groups with the same root group id are contiguous.
        const mergeColDefs = [];
        for (let i = 1; i <= leafPathTrees.length; i++) {
            const first = leafPathTrees[i - 1];
            const second = leafPathTrees[i];
            if (matchingRootGroupIds(first, second)) {
                leafPathTrees[i] = mergeTrees(first, second);
            }
            else {
                mergeColDefs.push(first);
            }
        }
        return mergeColDefs;
    }
    addChildrenToGroup(tree, groupId, colDef) {
        const subGroupIsSplit = (currentSubGroup, currentSubGroupToAdd) => {
            const existingChildIds = currentSubGroup.children.map(this.getId);
            const childGroupAlreadyExists = _.includes(existingChildIds, this.getId(currentSubGroupToAdd));
            const lastChild = _.last(currentSubGroup.children);
            const lastChildIsDifferent = lastChild && this.getId(lastChild) !== this.getId(currentSubGroupToAdd);
            return childGroupAlreadyExists && lastChildIsDifferent;
        };
        if (!this.isColGroupDef(tree)) {
            return true;
        }
        const currentGroup = tree;
        const groupToAdd = colDef;
        if (subGroupIsSplit(currentGroup, groupToAdd)) {
            currentGroup.children.push(groupToAdd);
            return true;
        }
        if (currentGroup.groupId === groupId) {
            // add children that don't already exist to group
            const existingChildIds = currentGroup.children.map(this.getId);
            const colDefAlreadyPresent = _.includes(existingChildIds, this.getId(groupToAdd));
            if (!colDefAlreadyPresent) {
                currentGroup.children.push(groupToAdd);
                return true;
            }
        }
        // recurse until correct group is found to add children
        currentGroup.children.forEach(subGroup => this.addChildrenToGroup(subGroup, groupId, colDef));
        return false;
    }
};
__decorate([
    Autowired('columnModel')
], ToolPanelColDefService.prototype, "columnModel", void 0);
ToolPanelColDefService = __decorate([
    Bean('toolPanelColDefService')
], ToolPanelColDefService);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.0';

const SideBarModule = {
    version: VERSION,
    moduleName: ModuleNames.SideBarModule,
    beans: [ToolPanelColDefService],
    agStackComponents: [
        { componentName: 'AgHorizontalResize', componentClass: HorizontalResizeComp },
        { componentName: 'AgSideBar', componentClass: SideBarComp },
        { componentName: 'AgSideBarButtons', componentClass: SideBarButtonsComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

export { SideBarModule, ToolPanelColDefService };
