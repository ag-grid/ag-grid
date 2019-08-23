import {
    Autowired,
    AgEvent,
    Component,
    GridOptionsWrapper,
    PostConstruct,
    ToolPanelDef,
    RefSelector,
    _
} from "ag-grid-community";

export interface SideBarButtonClickedEvent extends AgEvent {
    toolPanelId: string;
}

export class SideBarButtonsComp extends Component {

    public static EVENT_SIDE_BAR_BUTTON_CLICKED = 'sideBarButtonClicked';

    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    private static readonly TEMPLATE: string = `<div class="ag-side-buttons"></div>`;

    private buttonComps: SideBarButtonComp[] = [];

    constructor() {
        super(SideBarButtonsComp.TEMPLATE);
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
        const buttonComp = new SideBarButtonComp(def);
        this.getContext().wireBean(buttonComp);
        this.buttonComps.push(buttonComp);
        this.getGui().appendChild(buttonComp.getGui());

        buttonComp.addEventListener(SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED, () => {
            this.dispatchEvent({
                type: SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED,
                toolPanelId: def.id
            });
        });
    }

    public clearButtons(): void {
        if (this.buttonComps) {
            this.buttonComps.forEach(comp => comp.destroy());
        }
        _.clearElement(this.getGui());
        this.buttonComps.length = 0;
    }

    public destroy(): void {
        this.clearButtons();
        super.destroy();
    }
}

class SideBarButtonComp extends Component {

    public static EVENT_TOGGLE_BUTTON_CLICKED  = 'toggleButtonClicked';

    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eToggleButton') private eToggleButton: HTMLButtonElement;

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

        const toggleButton = this.eToggleButton;
        const iconDiv = toggleButton.querySelector('div') as HTMLElement;

        iconDiv.insertAdjacentElement('afterbegin', _.createIconNoSpan(this.toolPanelDef.iconKey, this.gridOptionsWrapper));
        this.addDestroyableEventListener(this.eToggleButton, 'click', this.onButtonPressed.bind(this));
    }

    private createTemplate(): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const def = this.toolPanelDef;
        const label = translate(def.labelKey, def.labelDefault);
        const res =
            `<div class="ag-side-button">
                <button type="button" ref="eToggleButton">
                    <div></div>
                    <span>${label}</span>
                </button>
            </div>`;
        return res;
    }

    private onButtonPressed(): void {
        this.dispatchEvent({type: SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED});
    }

    public setSelected(selected: boolean): void {
        this.addOrRemoveCssClass('ag-selected', selected);
    }
}
