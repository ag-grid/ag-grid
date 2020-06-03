import { Component } from "./component";
import { FocusController } from "../focusController";
/**
 * This provides logic to override the default browser focus logic.
 *
 * When the component gets focus, it uses the grid logic to find out what should be focused,
 * and then focuses that instead.
 *
 * This is how we ensure when user tabs into the relevant section, we focus the correct item.
 * For example GridCore extends ManagedFocusComponent, and it ensures when it receives focus
 * that focus goes to the first cell of the first header row.
 */
export declare class ManagedFocusComponent extends Component {
    protected onTabKeyDown?(e: KeyboardEvent): void;
    protected handleKeyDown?(e: KeyboardEvent): void;
    static FOCUS_MANAGED_CLASS: string;
    private topTabGuard;
    private bottomTabGuard;
    private skipTabGuardFocus;
    protected focusController: FocusController;
    protected postConstruct(): void;
    protected wireFocusManagement(): void;
    protected isFocusableContainer(): boolean;
    protected focusInnerElement(fromBottom?: boolean): void;
    protected onFocusIn(e: FocusEvent): void;
    protected onFocusOut(e: FocusEvent): void;
    forceFocusOutOfContainer(): void;
    appendChild(newChild: HTMLElement | Component, container?: HTMLElement): void;
    private createTabGuard;
    private addTabGuards;
    private forEachTabGuard;
    private addKeyDownListeners;
    private onFocus;
    private activateTabGuards;
    private deactivateTabGuards;
}
