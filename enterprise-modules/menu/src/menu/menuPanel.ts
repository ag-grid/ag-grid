import { ManagedFocusComponent, IComponent, KeyCode } from '@ag-grid-community/core';
import { MenuItemComponent } from './menuItemComponent';

export class MenuPanel extends ManagedFocusComponent {
    constructor(private readonly wrappedComponent: IComponent<any>) {
        super(undefined, true);

        this.setTemplateFromElement(wrappedComponent.getGui());
    }

    handleKeyDown(e: KeyboardEvent): void {
        switch (e.keyCode) {
            case KeyCode.ESCAPE: {
                this.closePanel();
                break;
            }
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