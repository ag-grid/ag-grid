import type {
    ElementParams,
    IToolbarItemComp,
    IToolbarItemParams,
    IconName,
    ToolbarItemActionParams,
} from 'ag-grid-community';
import {
    Component,
    RefPlaceholder,
    _addGridCommonParams,
    _addOrRemoveAttribute,
    _clearElement,
    _createIconNoSpan,
    _setAriaLabel,
    _setDisplayed,
} from 'ag-grid-community';

interface ButtonToolbarItemParams extends IToolbarItemParams {
    label?: string;
    tooltip?: string;
    icon?: IconName;
    action?: (params: ToolbarItemActionParams) => void;
}

const ButtonToolbarItemElement: ElementParams = {
    tag: 'button',
    cls: 'ag-toolbar-item ag-toolbar-button',
    attrs: { type: 'button' },
    children: [
        { tag: 'span', ref: 'eIcon', cls: 'ag-toolbar-button-icon', attrs: { 'aria-hidden': 'true' } },
        { tag: 'span', ref: 'eLabel', cls: 'ag-toolbar-button-label' },
    ],
};

export class ButtonToolbarItem extends Component implements IToolbarItemComp {
    private readonly eIcon: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;
    private params!: ButtonToolbarItemParams;

    constructor() {
        super(ButtonToolbarItemElement);
    }

    public init(params: ButtonToolbarItemParams): void {
        this.applyParams(params);
        this.addManagedElementListeners(this.getGui(), {
            click: () => this.invokeAction(),
        });
    }

    public refresh(params: ButtonToolbarItemParams): boolean {
        this.applyParams(params);
        return true;
    }

    private applyParams(params: ButtonToolbarItemParams): void {
        this.params = params;
        const eGui = this.getGui();

        _clearElement(this.eIcon);
        const hasIcon = !!params.icon;
        if (hasIcon) {
            const eIconEl = _createIconNoSpan(params.icon!, this.beans);
            if (eIconEl) {
                this.eIcon.appendChild(eIconEl);
            }
        }
        _setDisplayed(this.eIcon, hasIcon);

        const hasLabel = !!params.label;
        this.eLabel.textContent = params.label ?? '';
        _setDisplayed(this.eLabel, hasLabel);

        const hoverText = params.tooltip ?? params.label;
        _setAriaLabel(eGui, hoverText);
        _addOrRemoveAttribute(eGui, 'title', hoverText);
    }

    private invokeAction(): void {
        const { action, key } = this.params;
        if (!action) {
            return;
        }
        const actionParams: ToolbarItemActionParams = _addGridCommonParams(this.gos, { key });
        action(actionParams);
    }
}
