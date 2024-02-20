import { Component } from "./component";
import { TabGuardCtrl } from "./tabGuardCtrl";
export declare class TabGuardComp extends Component {
    private eTopGuard;
    private eBottomGuard;
    private eFocusableElement;
    protected tabGuardCtrl: TabGuardCtrl;
    protected initialiseTabGuard(params: {
        focusInnerElement?: (fromBottom: boolean) => void;
        shouldStopEventPropagation?: () => boolean;
        /**
         * @return `true` to prevent the default onFocusIn behavior
         */
        onFocusIn?: (e: FocusEvent) => void;
        /**
         * @return `true` to prevent the default onFocusOut behavior
         */
        onFocusOut?: (e: FocusEvent) => void;
        onTabKeyDown?: (e: KeyboardEvent) => void;
        handleKeyDown?: (e: KeyboardEvent) => void;
        /**
         * Set to true to create a circular focus pattern when keyboard tabbing.
         */
        focusTrapActive?: boolean;
        /**
         * Set to true to find a focusable element outside of the TabGuards to focus
         */
        forceFocusOutWhenTabGuardsAreEmpty?: boolean;
    }): void;
    private createTabGuard;
    private addTabGuards;
    protected removeAllChildrenExceptTabGuards(): void;
    forceFocusOutOfContainer(up?: boolean): void;
    appendChild(newChild: Component | HTMLElement, container?: HTMLElement | undefined): void;
}
