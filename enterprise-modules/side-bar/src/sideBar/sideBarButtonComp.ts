import type { ToolPanelDef } from '@ag-grid-community/core';
import { Component, RefPlaceholder, _createIconNoSpan, _setAriaExpanded } from '@ag-grid-community/core';

export type SideBarButtonCompEvent = 'toggleButtonClicked';
export class SideBarButtonComp extends Component<SideBarButtonCompEvent> {
    public static EVENT_TOGGLE_BUTTON_CLICKED = 'toggleButtonClicked';

    private readonly eToggleButton: HTMLButtonElement = RefPlaceholder;
    private readonly eIconWrapper: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;

    private readonly toolPanelDef: ToolPanelDef;

    constructor(toolPanelDef: ToolPanelDef) {
        super();
        this.toolPanelDef = toolPanelDef;
    }

    public getToolPanelId(): string {
        return this.toolPanelDef.id;
    }

    public postConstruct(): void {
        const template = this.createTemplate();
        this.setTemplate(template, []);
        this.setLabel();
        this.setIcon();
        this.addManagedListener(this.eToggleButton, 'click', this.onButtonPressed.bind(this));
        this.eToggleButton.setAttribute('id', `ag-${this.getCompId()}-button`);
    }

    private createTemplate(): string {
        const res =
            /* html */
            `<div class="ag-side-button" role="presentation">
                <button type="button" data-ref="eToggleButton" tabindex="-1" role="tab" aria-expanded="false" class="ag-button ag-side-button-button">
                    <div data-ref="eIconWrapper" class="ag-side-button-icon-wrapper" aria-hidden="true"></div>
                    <span data-ref="eLabel" class="ag-side-button-label"></span>
                </button>
            </div>`;
        return res;
    }

    private setLabel(): void {
        const translate = this.localeService.getLocaleTextFunc();
        const def = this.toolPanelDef;
        const label = translate(def.labelKey, def.labelDefault);

        this.eLabel.innerText = label;
    }

    private setIcon(): void {
        this.eIconWrapper.insertAdjacentElement('afterbegin', _createIconNoSpan(this.toolPanelDef.iconKey, this.gos)!);
    }

    private onButtonPressed(): void {
        this.dispatchLocalEvent({ type: 'toggleButtonClicked' });
    }

    public setSelected(selected: boolean): void {
        this.addOrRemoveCssClass('ag-selected', selected);
        _setAriaExpanded(this.eToggleButton, selected);
    }

    public getButtonElement(): Element {
        return this.eToggleButton;
    }
}
