import { PostConstruct } from '../context/context';
import { KeyCode } from '../constants/keyCode';
import { AgMenuItemComponent } from './agMenuItemComponent';
import { TabGuardComp } from './tabGuardComp';
import { IComponent } from '../interfaces/iComponent';

export class AgMenuPanel extends TabGuardComp {
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
        const menuItem = (this.parentComponent as AgMenuItemComponent);
        menuItem.closeSubMenu();
        setTimeout(() => menuItem.getGui().focus(), 0);
    }
}