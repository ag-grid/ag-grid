import { ManagedFocusContainer, IComponent, KeyCode } from '@ag-grid-community/core';
import { MenuItemComponent } from './menuItemComponent';

export class MenuPanel extends ManagedFocusContainer {
    constructor(private readonly wrappedComponent: IComponent<any>) {
        super();

        this.setTemplateFromElement(wrappedComponent.getGui());
    }

    handleKeyDown(e: KeyboardEvent): void {
        if (e.keyCode === KeyCode.ESCAPE) {
            this.closePanel();
        }
    }

    onTabKeyDown(e: KeyboardEvent): void {
        super.onTabKeyDown(e);

        if (e.defaultPrevented) { return; }

        this.closePanel();
        e.preventDefault();
    }

    private closePanel(): void {
        const menuItem = (this.parentComponent as MenuItemComponent);
        menuItem.closeSubMenu();
        setTimeout(() => menuItem.getGui().focus(), 0);
    }
}