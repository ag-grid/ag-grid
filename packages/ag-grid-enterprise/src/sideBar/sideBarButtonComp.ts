import type { ElementParams, IconName, ToolPanelDef } from 'ag-grid-community';
import { Component, RefPlaceholder, _createIconNoSpan, _setAriaExpanded } from 'ag-grid-community';

export type SideBarButtonCompEvent = 'toggleButtonClicked';
const SideBarButtonElement: ElementParams = {
    tag: 'div',
    cls: 'ag-side-button',
    role: 'presentation',
    children: [
        {
            tag: 'button',
            ref: 'eToggleButton',
            cls: 'ag-button ag-side-button-button',
            role: 'tab',
            attrs: { type: 'button', tabindex: '-1', 'aria-expanded': 'false' },
            children: [
                {
                    tag: 'div',
                    ref: 'eIconWrapper',
                    cls: 'ag-side-button-icon-wrapper',
                    attrs: { 'aria-hidden': 'true' },
                },
                { tag: 'span', ref: 'eLabel', cls: 'ag-side-button-label' },
            ],
        },
    ],
};
export class SideBarButtonComp extends Component<SideBarButtonCompEvent> {
    public readonly eToggleButton: HTMLButtonElement = RefPlaceholder;
    private readonly eIconWrapper: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;

    constructor(private readonly toolPanelDef: ToolPanelDef) {
        super();
    }

    public getToolPanelId(): string {
        return this.toolPanelDef.id;
    }

    public postConstruct(): void {
        this.setTemplate(SideBarButtonElement, []);
        this.setLabel();
        this.setIcon();
        this.addManagedElementListeners(this.eToggleButton, { click: this.onButtonPressed.bind(this) });
        this.eToggleButton.setAttribute('id', `ag-${this.getCompId()}-button`);
    }

    private setLabel(): void {
        const def = this.toolPanelDef;
        const label = this.getLocaleTextFunc()(def.labelKey, def.labelDefault);

        this.eLabel.textContent = label;
    }

    private setIcon(): void {
        this.eIconWrapper.insertAdjacentElement(
            'afterbegin',
            _createIconNoSpan(this.toolPanelDef.iconKey as IconName, this.beans)!
        );
    }

    private onButtonPressed(): void {
        this.dispatchLocalEvent({ type: 'toggleButtonClicked' });
    }

    public setSelected(selected: boolean): void {
        this.toggleCss('ag-selected', selected);
        _setAriaExpanded(this.eToggleButton, selected);
    }
}
