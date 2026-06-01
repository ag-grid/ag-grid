import { RefPlaceholder } from 'ag-stack';

import type { ElementParams, IToolbarItemComp, IToolbarItemParams, ToolbarItemActionParams } from 'ag-grid-community';
import { Component, _addGridCommonParams } from 'ag-grid-community';

import { renderToolbarButtonContents } from './toolbarItemUtils';

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
    readonly agToolbarButton = 'agToolbarButton' as const;

    private readonly eIcon: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;
    private params!: IToolbarItemParams;

    constructor() {
        super(ButtonToolbarItemElement);
    }

    public init(params: IToolbarItemParams): void {
        this.applyParams(params);
        this.addManagedElementListeners(this.getGui(), {
            click: () => this.invokeAction(),
        });
    }

    public refresh(params: IToolbarItemParams): boolean {
        this.applyParams(params);
        return true;
    }

    private applyParams(params: IToolbarItemParams): void {
        this.params = params;
        renderToolbarButtonContents(this.beans, {
            eIcon: this.eIcon,
            eLabel: this.eLabel,
            eGui: this.getGui(),
            icon: params.icon,
            label: params.label,
            hoverText: params.tooltip ?? params.label,
        });
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
