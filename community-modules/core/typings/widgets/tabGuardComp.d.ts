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
        onFocusIn?: (e: FocusEvent) => boolean;
        /**
         * @return `true` to prevent the default onFocusOut behavior
         */
        onFocusOut?: (e: FocusEvent) => boolean;
        onTabKeyDown?: (e: KeyboardEvent) => void;
        handleKeyDown?: (e: KeyboardEvent) => void;
    }): void;
    private createTabGuard;
    private addTabGuards;
    protected removeAllChildrenExceptTabGuards(): void;
    forceFocusOutOfContainer(up?: boolean): void;
    appendChild(newChild: HTMLElement | Component, container?: HTMLElement): void;
}
