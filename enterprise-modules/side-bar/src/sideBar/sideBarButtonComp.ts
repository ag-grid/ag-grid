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
        this.eIconWrapper.insertAdjacentElement('afterbegin', _.createIconNoSpan(this.toolPanelDef.iconKey, this.gridOptionsService)!);
        this.addManagedListener(this.eToggleButton, 'click', this.onButtonPressed.bind(this));
    }

    private createTemplate(): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const def = this.toolPanelDef;
        const label = translate(def.labelKey, def.labelDefault);
        const res = /* html */
            `<div class="ag-side-button" role="presentation">
                <button type="button" ref="eToggleButton" tabindex="-1" role="tab" class="ag-side-button-button">
                    <div ref="eIconWrapper" class="ag-side-button-icon-wrapper" aria-hidden="true"></div>
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
