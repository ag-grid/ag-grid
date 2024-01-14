import { BeanStub } from "../context/beanStub";
export declare enum TabGuardClassNames {
    TAB_GUARD = "ag-tab-guard",
    TAB_GUARD_TOP = "ag-tab-guard-top",
    TAB_GUARD_BOTTOM = "ag-tab-guard-bottom"
}
export interface ITabGuard {
    setTabIndex(tabIndex?: string): void;
}
export declare class TabGuardCtrl extends BeanStub {
    private readonly focusService;
    private readonly comp;
    private readonly eTopGuard;
    private readonly eBottomGuard;
    private readonly eFocusableElement;
    private readonly focusTrapActive;
    private readonly providedFocusInnerElement?;
    private readonly providedFocusIn?;
    private readonly providedFocusOut?;
    private readonly providedShouldStopEventPropagation?;
    private readonly providedOnTabKeyDown?;
    private readonly providedHandleKeyDown?;
    private skipTabGuardFocus;
    constructor(params: {
        comp: ITabGuard;
        eTopGuard: HTMLElement;
        eBottomGuard: HTMLElement;
        eFocusableElement: HTMLElement;
        focusTrapActive?: boolean;
        focusInnerElement?: (fromBottom: boolean) => void;
        onFocusIn?: (event: FocusEvent) => void;
        onFocusOut?: (event: FocusEvent) => void;
        shouldStopEventPropagation?: () => boolean;
        onTabKeyDown?: (e: KeyboardEvent) => void;
        handleKeyDown?: (e: KeyboardEvent) => void;
    });
    private postConstruct;
    private handleKeyDown;
    private tabGuardsAreActive;
    private shouldStopEventPropagation;
    private activateTabGuards;
    private deactivateTabGuards;
    private onFocus;
    private onFocusIn;
    private onFocusOut;
    onTabKeyDown(e: KeyboardEvent): void;
    focusInnerElement(fromBottom?: boolean): void;
    getNextFocusableElement(backwards?: boolean): HTMLElement | null;
    forceFocusOutOfContainer(up?: boolean): void;
}
