// Type definitions for @ag-grid-community/core v28.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
    appendChild(newChild: Component | HTMLElement, container?: HTMLElement | undefined): void;
}
