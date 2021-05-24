// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from './component';
import { FocusController } from '../focusController';
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
    private readonly isFocusableContainer;
    protected handleKeyDown?(e: KeyboardEvent): void;
    static FOCUS_MANAGED_CLASS: string;
    private topTabGuard;
    private bottomTabGuard;
    private skipTabGuardFocus;
    protected readonly focusController: FocusController;
    constructor(template?: string, isFocusableContainer?: boolean);
    protected postConstruct(): void;
    protected focusInnerElement(fromBottom?: boolean): void;
    /**
     * By default this will tab though the elements in the default order. Override if you require special logic.
     */
    protected onTabKeyDown(e: KeyboardEvent): void;
    protected onFocusIn(e: FocusEvent): void;
    protected onFocusOut(e: FocusEvent): void;
    forceFocusOutOfContainer(up?: boolean): void;
    appendChild(newChild: HTMLElement | Component, container?: HTMLElement): void;
    private createTabGuard;
    private addTabGuards;
    private forEachTabGuard;
    private addKeyDownListeners;
    protected shouldStopEventPropagation(e: KeyboardEvent): boolean;
    private onFocus;
    private activateTabGuards;
    private deactivateTabGuards;
    private tabGuardsAreActive;
    protected clearGui(): void;
}
