import {
    RefPlaceholder,
    _removeAriaExpanded,
    _setAriaExpanded,
    _setAriaHasPopup,
    _setDisabled,
    _setDisplayed,
} from 'ag-stack';

import type { ElementParams, IToolbarItemComp, IToolbarItemParams, ToolbarMenuItemParams } from 'ag-grid-community';
import { Component, _createIconNoSpan } from 'ag-grid-community';

import type { ToolbarMenuBuilder } from '../../menu/toolbarMenuBuilder';
import { renderToolbarButtonContents } from './toolbarItemUtils';

type MenuItemParams = IToolbarItemParams<any, any, ToolbarMenuItemParams>;

const MenuToolbarItemElement: ElementParams = {
    tag: 'button',
    cls: 'ag-toolbar-item ag-toolbar-button',
    attrs: { type: 'button' },
    children: [
        { tag: 'span', ref: 'eIcon', cls: 'ag-toolbar-button-icon', attrs: { 'aria-hidden': 'true' } },
        { tag: 'span', ref: 'eLabel', cls: 'ag-toolbar-button-label' },
        { tag: 'span', ref: 'eChevron', cls: 'ag-toolbar-button-chevron', attrs: { 'aria-hidden': 'true' } },
    ],
};

export class MenuToolbarItem extends Component implements IToolbarItemComp {
    readonly agToolbarButton = 'agToolbarButton' as const;

    private readonly eIcon: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;
    private readonly eChevron: HTMLElement = RefPlaceholder;
    private params!: MenuItemParams;

    constructor() {
        super(MenuToolbarItemElement);
    }

    public init(params: IToolbarItemParams): void {
        const eChevronIcon = _createIconNoSpan('selectOpen', this.beans);
        if (eChevronIcon) {
            this.eChevron.appendChild(eChevronIcon);
        }
        this.beans.gos.assertModuleRegistered(
            ['ContextMenu', 'ColumnMenu'],
            `AG Grid toolbar item: \`agMenuToolbarItem\``
        );
        this.applyParams(params as MenuItemParams);
        this.addManagedElementListeners(this.getGui(), {
            click: () => this.showMenu(),
        });
    }

    public refresh(params: IToolbarItemParams): boolean {
        this.applyParams(params as MenuItemParams);
        return true;
    }

    private getAccessibleName(): string {
        const { tooltip, label } = this.params;
        return tooltip ?? label ?? this.getLocaleTextFunc()('toolbarMenu', 'Menu');
    }

    private applyParams(params: MenuItemParams): void {
        this.params = params;
        const eGui = this.getGui();

        renderToolbarButtonContents(this.beans, {
            eIcon: this.eIcon,
            eLabel: this.eLabel,
            eGui,
            icon: params.icon ?? 'menu',
            label: params.label,
            hoverText: this.getAccessibleName(),
        });

        const menuItems = params.toolbarItemParams?.menuItems;
        const hasMenuItems = !!menuItems?.length;
        _setDisplayed(this.eChevron, hasMenuItems);
        _setDisabled(eGui, !hasMenuItems);
        _setAriaHasPopup(eGui, hasMenuItems ? 'menu' : false);
        if (hasMenuItems) {
            _setAriaExpanded(eGui, false);
        } else {
            _removeAriaExpanded(eGui);
        }
    }

    private showMenu(): void {
        const menuItems = this.params.toolbarItemParams?.menuItems;
        if (!menuItems?.length) {
            return;
        }

        const toolbarMenuBuilder = this.beans.toolbarMenuBuilder as ToolbarMenuBuilder | undefined;
        if (!toolbarMenuBuilder) {
            return;
        }

        const eGui = this.getGui();
        _setAriaExpanded(eGui, true);

        toolbarMenuBuilder.showMenu({
            anchorElement: eGui,
            menuItems,
            ariaLabel: this.getAccessibleName(),
            onClose: () => {
                if (this.isAlive()) {
                    _setAriaExpanded(eGui, false);
                    eGui.focus();
                }
            },
        });
    }
}
