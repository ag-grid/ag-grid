import {
    Component,
    PostConstruct,
    RefSelector,
    ToolPanelDef,
    _,
} from "@ag-grid-community/core";

export class SideBarButtonComp extends Component {

    public static EVENT_TOGGLE_BUTTON_CLICKED = 'toggleButtonClicked';

    @RefSelector('eToggleButton') private eToggleButton: HTMLButtonElement;
    @RefSelector('eIconWrapper') private eIconWrapper: HTMLElement;
    @RefSelector('eLabel') private eLabel: HTMLElement;

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
        this.setLabel();
        this.setIcon();
        this.addManagedListener(this.eToggleButton, 'click', this.onButtonPressed.bind(this));
    }

    private createTemplate(): string {
        const res = /* html */
            `<div class="ag-side-button" role="presentation">
                <button type="button" ref="eToggleButton" tabindex="-1" role="tab" class="ag-side-button-button">
                    <div ref="eIconWrapper" class="ag-side-button-icon-wrapper" aria-hidden="true"></div>
                    <span ref ="eLabel" class="ag-side-button-label"></span>
                </button>
            </div>`;
        return res;
    }
    
    private setLabel(): void {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const def = this.toolPanelDef;
        const label = translate(def.labelKey, def.labelDefault);

        this.eLabel.innerText = label;
    }

    private setIcon(): void {
        this.eIconWrapper.insertAdjacentElement('afterbegin', _.createIconNoSpan(this.toolPanelDef.iconKey, this.gridOptionsService)!);
    }

    private onButtonPressed(): void {
        this.dispatchEvent({ type: SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED });
    }

    public setSelected(selected: boolean): void {
        this.addOrRemoveCssClass('ag-selected', selected);
    }
}
