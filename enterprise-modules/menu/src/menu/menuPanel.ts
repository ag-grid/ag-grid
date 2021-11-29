import { TabGuardComp, IComponent, KeyCode, PostConstruct } from '@ag-grid-community/core';
import { MenuItemComponent } from './menuItemComponent';

export class MenuPanel extends TabGuardComp {
    constructor(private readonly wrappedComponent: IComponent<any>) {
        super();

        this.setTemplateFromElement(wrappedComponent.getGui());
    }
    
    @PostConstruct
    private postConstruct() {
        this.initialiseTabGuard({
            onTabKeyDown: e => this.onTabKeyDown(e),
            handleKeyDown: e => this.handleKeyDown(e)
        });
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.key === KeyCode.ESCAPE) {
            this.closePanel();
        }
    }

    private onTabKeyDown(e: KeyboardEvent): void {
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