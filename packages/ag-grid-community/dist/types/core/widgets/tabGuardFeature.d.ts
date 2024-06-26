import { BeanStub } from '../context/beanStub';
import type { Component } from './component';
import { TabGuardCtrl } from './tabGuardCtrl';
export interface TabGuardParams {
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
    isFocusableContainer?: boolean;
}
export declare class TabGuardFeature extends BeanStub {
    private readonly comp;
    private eTopGuard;
    private eBottomGuard;
    private eFocusableElement;
    private tabGuardCtrl;
    constructor(comp: Component<any>);
    initialiseTabGuard(params: TabGuardParams): void;
    getTabGuardCtrl(): TabGuardCtrl;
    private createTabGuard;
    private addTabGuards;
    removeAllChildrenExceptTabGuards(): void;
    forceFocusOutOfContainer(up?: boolean): void;
    appendChild(appendChild: (newChild: HTMLElement | Component<any>, container?: HTMLElement) => void, newChild: Component | HTMLElement, container?: HTMLElement | undefined): void;
}
