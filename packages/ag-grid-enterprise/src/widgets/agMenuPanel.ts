import type { IComponent } from 'ag-grid-community';
import { KeyCode, TabGuardComp } from 'ag-grid-community';

import type { AgMenuItemComponent } from './agMenuItemComponent';

export class AgMenuPanel extends TabGuardComp {
    constructor(wrappedComponent: IComponent<any>) {
        super();

        this.setTemplateFromElement(wrappedComponent.getGui(), undefined, undefined, true);
    }

    public postConstruct() {
        this.initialiseTabGuard({
            onTabKeyDown: (e) => this.onTabKeyDown(e),
            handleKeyDown: (e) => this.handleKeyDown(e),
        });
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.key === KeyCode.ESCAPE) {
            this.closePanel();
        }
    }

    private onTabKeyDown(e: KeyboardEvent): void {
        if (e.defaultPrevented) {
            return;
        }

        this.closePanel();
        e.preventDefault();
    }

    private closePanel(): void {
        const menuItem = this.parentComponent as unknown as AgMenuItemComponent;
        menuItem.closeSubMenu();
        setTimeout(() => menuItem.getGui().focus(), 0);
    }
}
