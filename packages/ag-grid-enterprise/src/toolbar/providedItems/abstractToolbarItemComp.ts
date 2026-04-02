import type { ElementParams, IToolbarItemComp, IToolbarItemParams, IconName, ToolbarDisplay } from 'ag-grid-community';
import { Component, RefPlaceholder, _createIconNoSpan } from 'ag-grid-community';

const AbstractToolbarItemElement: ElementParams = {
    tag: 'button',
    cls: 'ag-toolbar-item ag-toolbar-button',
    attrs: { type: 'button' },
    children: [
        { tag: 'span', ref: 'eIcon', cls: 'ag-toolbar-button-icon', attrs: { 'aria-hidden': 'true' } },
        { tag: 'span', ref: 'eLabel', cls: 'ag-toolbar-button-label' },
    ],
};

export abstract class AbstractToolbarItemComp extends Component implements IToolbarItemComp {
    private readonly eIcon: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;

    constructor() {
        super(AbstractToolbarItemElement);
    }

    public postConstruct(): void {
        const icon = _createIconNoSpan(this.getIconName(), this.beans);
        if (icon) {
            this.eIcon.appendChild(icon);
        }

        const label = this.getLocaleTextFunc()(this.getLocaleKey(), this.getDefaultLabel());
        this.eLabel.textContent = label;
        this.getGui().setAttribute('aria-label', label);

        this.addManagedElementListeners(this.getGui(), { click: () => this.onAction() });
    }

    public init(params: IToolbarItemParams): void {
        this.updateDisplay(params.display);
    }

    public refresh(params: IToolbarItemParams): boolean {
        this.updateDisplay(params.display);
        return true;
    }

    private updateDisplay(display: ToolbarDisplay): void {
        const showLabel = display === 'iconAndLabel';
        this.eLabel.classList.toggle('ag-hidden', !showLabel);
    }

    protected abstract getIconName(): IconName;
    protected abstract getLocaleKey(): string;
    protected abstract getDefaultLabel(): string;
    protected abstract onAction(): void;
}
