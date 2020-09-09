import {
    Autowired,
    AgEvent,
    Component,
    GridOptionsWrapper,
    PostConstruct,
    ToolPanelDef,
    RefSelector,
    PreDestroy,
    FocusController,
    HeaderPositionUtils,
    _,
    KeyCode
} from "@ag-grid-community/core";

export interface SideBarButtonClickedEvent extends AgEvent {
    toolPanelId: string;
}

export class SideBarButtonsComp extends Component {

    public static EVENT_SIDE_BAR_BUTTON_CLICKED = 'sideBarButtonClicked';
    private static readonly TEMPLATE: string = /* html */ `<div class="ag-side-buttons"></div>`;
    private buttonComps: SideBarButtonComp[] = [];

    @Autowired('focusController') private focusController: FocusController;
    @Autowired('headerPositionUtils') private headerPositionUtils: HeaderPositionUtils;

    constructor() {
        super(SideBarButtonsComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.getFocusableElement(), 'keydown', this.handleKeyDown.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.keyCode !== KeyCode.TAB || !e.shiftKey) { return; }
        const prevEl = this.focusController.findNextFocusableElement(this.getFocusableElement(), null, true);

        if (!prevEl) {
            const headerPosition = this.headerPositionUtils.findColAtEdgeForHeaderRow(0, 'start');
            if (!headerPosition) { return; }
            e.preventDefault();
            this.focusController.focusHeaderPosition(headerPosition);
        }
    }

    public setToolPanelDefs(toolPanelDefs: ToolPanelDef[]): void {
        toolPanelDefs.forEach(this.addButtonComp.bind(this));
    }

    public setActiveButton(id: string | undefined): void {
        this.buttonComps.forEach(comp => {
            comp.setSelected(id === comp.getToolPanelId());
        });
    }

    private addButtonComp(def: ToolPanelDef): void {
        const buttonComp = this.createBean(new SideBarButtonComp(def));
        this.buttonComps.push(buttonComp);
        this.appendChild(buttonComp);

        buttonComp.addEventListener(SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED, () => {
            this.dispatchEvent({
                type: SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED,
                toolPanelId: def.id
            });
        });
    }

    @PreDestroy
    public clearButtons(): void {
        this.buttonComps = this.destroyBeans(this.buttonComps);
        _.clearElement(this.getGui());
    }

}

class SideBarButtonComp extends Component {

    public static EVENT_TOGGLE_BUTTON_CLICKED = 'toggleButtonClicked';

    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eToggleButton') private eToggleButton: HTMLButtonElement;
    @RefSelector('eIconWrapper') private eIconWrapper: HTMLElement;

    private readonly toolPanelDef: ToolPanelDef;

    constructor(toolPanelDef: ToolPanelDef) {
        super();
        this.toolPanelDef = toolPanelDef;
    }

    public getToolPanelId(): string {
        return this.toolPanelDef.id;
    }

    @PostConstruct
    private postConstruct(): void {
        const template = this.createTemplate();
        this.setTemplate(template);
        this.eIconWrapper.insertAdjacentElement('afterbegin', _.createIconNoSpan(this.toolPanelDef.iconKey, this.gridOptionsWrapper));
        this.addManagedListener(this.eToggleButton, 'click', this.onButtonPressed.bind(this));
    }

    private createTemplate(): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const def = this.toolPanelDef;
        const label = translate(def.labelKey, def.labelDefault);
        const res =
            `<div class="ag-side-button">
                <button type="button" ref="eToggleButton" class="ag-side-button-button">
                    <div ref="eIconWrapper" class="ag-side-button-icon-wrapper"></div>
                    <span class="ag-side-button-label">${label}</span>
                </button>
            </div>`;
        return res;
    }

    private onButtonPressed(): void {
        this.dispatchEvent({ type: SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED });
    }

    public setSelected(selected: boolean): void {
        this.addOrRemoveCssClass('ag-selected', selected);
    }
}
