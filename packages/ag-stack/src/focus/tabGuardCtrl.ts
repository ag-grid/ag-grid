import { AgBeanStub } from '../core/agBeanStub';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _getDocument } from '../utils/document';
import { _findFocusableElements, _findNextFocusableElement } from '../utils/focus';
import type { StopPropagationCallbacks } from './agManagedFocusFeature';
import { AgManagedFocusFeature } from './agManagedFocusFeature';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const TabGuardClassNames = {
    TAB_GUARD: 'ag-tab-guard',
    TAB_GUARD_TOP: 'ag-tab-guard-top',
    TAB_GUARD_BOTTOM: 'ag-tab-guard-bottom',
} as const;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ITabGuard {
    setTabIndex(tabIndex?: string): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface TabGuardCtrlParams {
    comp: ITabGuard;
    eTopGuard: HTMLElement;
    eBottomGuard: HTMLElement;
    eFocusableElement: HTMLElement;
    focusTrapActive?: boolean;
    forceFocusOutWhenTabGuardsAreEmpty?: boolean;
    isFocusableContainer?: boolean;
    focusInnerElement?: (fromBottom: boolean) => boolean;
    onFocusIn?: (event: FocusEvent) => void;
    onFocusOut?: (event: FocusEvent) => void;
    onGuardFocusedFromInside?: (fromBottom: boolean) => boolean | undefined;
    shouldStopEventPropagation?: () => boolean;
    onTabKeyDown?: (e: KeyboardEvent) => void;
    handleKeyDown?: (e: KeyboardEvent) => void;
    isEmpty?: () => boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AgTabGuardCtrl<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
> extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService> {
    private readonly comp: ITabGuard;
    private readonly eTopGuard: HTMLElement;
    private readonly eBottomGuard: HTMLElement;

    private readonly eFocusableElement: HTMLElement;
    private readonly focusTrapActive: boolean;
    private readonly forceFocusOutWhenTabGuardsAreEmpty: boolean;
    // When true, this prevents the browser from tabbing into and out of the element.
    // Instead, focus must be handled manually
    private readonly isFocusableContainer: boolean;

    private readonly providedFocusInnerElement?: (fromBottom: boolean) => boolean;
    private readonly providedFocusIn?: (event: FocusEvent) => void;
    private readonly providedFocusOut?: (event: FocusEvent) => void;
    private readonly providedOnGuardFocusedFromInside?: (fromBottom: boolean) => boolean | undefined;

    private readonly providedShouldStopEventPropagation?: () => boolean;
    private readonly providedOnTabKeyDown?: (e: KeyboardEvent) => void;
    private readonly providedHandleKeyDown?: (e: KeyboardEvent) => void;
    private readonly providedIsEmpty?: () => boolean;

    private skipTabGuardFocus: boolean = false;
    private forcingFocusOut: boolean = false;
    private lastFocusedElementInside: HTMLElement | null = null;
    // Used when `isFocusableContainer` enabled
    private allowFocus: boolean = false;

    constructor(
        params: TabGuardCtrlParams,
        private readonly stopPropagationCallbacks?: StopPropagationCallbacks
    ) {
        super();

        const {
            comp,
            eTopGuard,
            eBottomGuard,
            focusTrapActive,
            forceFocusOutWhenTabGuardsAreEmpty,
            isFocusableContainer,
            focusInnerElement,
            onFocusIn,
            onFocusOut,
            onGuardFocusedFromInside,
            shouldStopEventPropagation,
            onTabKeyDown,
            handleKeyDown,
            isEmpty,
            eFocusableElement,
        } = params;

        this.comp = comp;

        this.eTopGuard = eTopGuard;
        this.eBottomGuard = eBottomGuard;
        this.providedFocusInnerElement = focusInnerElement;
        this.eFocusableElement = eFocusableElement;
        this.focusTrapActive = !!focusTrapActive;
        this.forceFocusOutWhenTabGuardsAreEmpty = !!forceFocusOutWhenTabGuardsAreEmpty;
        this.isFocusableContainer = !!isFocusableContainer;

        this.providedFocusIn = onFocusIn;
        this.providedFocusOut = onFocusOut;
        this.providedOnGuardFocusedFromInside = onGuardFocusedFromInside;
        this.providedShouldStopEventPropagation = shouldStopEventPropagation;
        this.providedOnTabKeyDown = onTabKeyDown;
        this.providedHandleKeyDown = handleKeyDown;
        this.providedIsEmpty = isEmpty;
    }

    public postConstruct() {
        this.createManagedBean<
            AgManagedFocusFeature<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
        >(
            new AgManagedFocusFeature(this.eFocusableElement, this.stopPropagationCallbacks, {
                shouldStopEventPropagation: () => this.shouldStopEventPropagation(),
                onTabKeyDown: (e) => this.onTabKeyDown(e),
                handleKeyDown: (e) => this.handleKeyDown(e),
                onFocusIn: (e) => this.onFocusIn(e),
                onFocusOut: (e) => this.onFocusOut(e),
            })
        );

        this.activateTabGuards();

        for (const guard of [this.eTopGuard, this.eBottomGuard]) {
            this.addManagedElementListeners(guard, { focus: this.onFocus.bind(this) });
        }
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (this.providedHandleKeyDown) {
            this.providedHandleKeyDown(e);
        }
    }

    private tabGuardsAreActive(): boolean {
        return !!this.eTopGuard && this.eTopGuard.hasAttribute('tabIndex');
    }

    private shouldStopEventPropagation(): boolean {
        if (this.providedShouldStopEventPropagation) {
            return this.providedShouldStopEventPropagation();
        }
        return false;
    }

    private activateTabGuards(): void {
        // Do not activate tabs while focus is being forced out
        if (this.forcingFocusOut) {
            return;
        }
        const tabIndex = this.gos.get('tabIndex')!;
        this.comp.setTabIndex(tabIndex.toString());
    }

    private deactivateTabGuards(): void {
        this.comp.setTabIndex();
    }

    private onFocus(e: FocusEvent): void {
        if (this.isFocusableContainer && !this.eFocusableElement.contains(e.relatedTarget as HTMLElement)) {
            if (!this.allowFocus) {
                this.findNextElementOutsideAndFocus(e.target === this.eBottomGuard);
                return;
            }
        }

        if (this.skipTabGuardFocus) {
            this.skipTabGuardFocus = false;
            return;
        }

        // when there are no focusable items within the TabGuard, focus gets stuck
        // in the TabGuard itself and has nowhere to go, so we need to manually find
        // the closest element to focus by calling `forceFocusOutWhenTabGuardAreEmpty`.
        if (this.forceFocusOutWhenTabGuardsAreEmpty) {
            const isEmpty = this.providedIsEmpty
                ? this.providedIsEmpty()
                : _findFocusableElements(this.eFocusableElement, '.ag-tab-guard').length === 0;
            if (isEmpty) {
                this.findNextElementOutsideAndFocus(e.target === this.eBottomGuard);
                return;
            }
        }

        if (this.isFocusableContainer && this.eFocusableElement.contains(e.relatedTarget as HTMLElement)) {
            const fromBottom = e.target === this.eBottomGuard;
            const focusHandled = this.providedOnGuardFocusedFromInside?.(fromBottom);

            if (focusHandled === true && _getDocument(this.beans).activeElement === e.target) {
                const relatedTarget = e.relatedTarget as HTMLElement;
                const focusTarget = relatedTarget.classList.contains(TabGuardClassNames.TAB_GUARD)
                    ? this.lastFocusedElementInside
                    : relatedTarget;
                focusTarget?.focus();
            } else if (focusHandled === false) {
                this.findNextElementOutsideAndFocus(!fromBottom);
            }
            return;
        }

        const fromBottom = e.target === this.eBottomGuard;

        const hasFocusedInnerElement = this.providedFocusInnerElement
            ? this.providedFocusInnerElement(fromBottom)
            : this.focusInnerElement(fromBottom);
        if (!hasFocusedInnerElement && this.forceFocusOutWhenTabGuardsAreEmpty) {
            // nothing actually got focused, so force out
            this.findNextElementOutsideAndFocus(e.target === this.eBottomGuard);
        }
    }

    private findNextElementOutsideAndFocus(up: boolean, excludeElements?: HTMLElement[]): boolean {
        const eDocument = _getDocument(this.beans);
        const focusableEls = _findFocusableElements(eDocument.body, null, true)
            .filter((element) => element.tabIndex >= 0)
            .map((element, domIndex) => ({ element, domIndex }))
            .sort((a, b) => {
                const tabIndexA = a.element.tabIndex || Number.MAX_SAFE_INTEGER;
                const tabIndexB = b.element.tabIndex || Number.MAX_SAFE_INTEGER;

                return tabIndexA - tabIndexB || a.domIndex - b.domIndex;
            })
            .map(({ element }) => element);
        const tabGuard = up ? this.eTopGuard : this.eBottomGuard;
        const index = focusableEls.indexOf(tabGuard);

        if (index === -1) {
            return false;
        }

        const step = up ? -1 : 1;
        for (
            let currentIndex = index + step;
            currentIndex >= 0 && currentIndex < focusableEls.length;
            currentIndex += step
        ) {
            const focusTarget = focusableEls[currentIndex];
            if (!excludeElements?.some((excludeElement) => excludeElement.contains(focusTarget))) {
                focusTarget.focus();
                return true;
            }
        }

        return false;
    }

    private onFocusIn(e: FocusEvent): void {
        if (this.focusTrapActive || this.forcingFocusOut) {
            return;
        }

        const target = e.target as HTMLElement;
        if (!target.classList.contains(TabGuardClassNames.TAB_GUARD)) {
            this.lastFocusedElementInside = target;
        }

        if (this.providedFocusIn) {
            this.providedFocusIn(e);
        }

        if (!this.isFocusableContainer) {
            this.deactivateTabGuards();
        }
    }

    private onFocusOut(e: FocusEvent): void {
        if (this.focusTrapActive) {
            return;
        }

        if (this.providedFocusOut) {
            this.providedFocusOut(e);
        }

        if (!this.eFocusableElement.contains(e.relatedTarget as HTMLElement)) {
            this.activateTabGuards();
        }
    }

    public onTabKeyDown(e: KeyboardEvent): void {
        if (this.providedOnTabKeyDown) {
            this.providedOnTabKeyDown(e);
            return;
        }

        if (this.focusTrapActive) {
            return;
        }
        if (e.defaultPrevented) {
            return;
        }

        const tabGuardsAreActive = this.tabGuardsAreActive();

        if (tabGuardsAreActive) {
            this.deactivateTabGuards();
        }

        const nextRoot = this.getNextFocusableElement(e.shiftKey);

        if (tabGuardsAreActive) {
            // ensure the tab guards are only re-instated once the event has finished processing, to avoid the browser
            // tabbing to the tab guard from inside the component
            setTimeout(() => this.activateTabGuards(), 0);
        }

        if (!nextRoot) {
            return;
        }

        nextRoot.focus();
        e.preventDefault();
    }

    public focusInnerElement(fromBottom = false): boolean {
        const focusable = _findFocusableElements(this.eFocusableElement);

        if (this.tabGuardsAreActive()) {
            // remove tab guards from this component from list of focusable elements
            focusable.splice(0, 1);
            focusable.splice(-1, 1);
        }

        if (!focusable.length) {
            return false;
        }

        focusable[fromBottom ? focusable.length - 1 : 0].focus({ preventScroll: true });
        return true;
    }

    public getNextFocusableElement(backwards?: boolean): HTMLElement | null {
        return _findNextFocusableElement(this.beans, this.eFocusableElement, false, backwards);
    }

    public forceFocusOutOfContainer(up: boolean = false): void {
        // avoid multiple calls to `forceFocusOutOfContainer`
        if (this.forcingFocusOut) {
            return;
        }

        const tabGuardToFocus = up ? this.eTopGuard : this.eBottomGuard;

        this.activateTabGuards();
        this.skipTabGuardFocus = true;
        this.forcingFocusOut = true;

        // this focus will set `this.skipTabGuardFocus` to false;
        tabGuardToFocus.focus();

        window.setTimeout(() => {
            this.forcingFocusOut = false;
            this.activateTabGuards();
        });
    }

    public focusNextElementOutsideContainer(up: boolean, excludeElements: HTMLElement[]): boolean {
        return this.findNextElementOutsideAndFocus(up, excludeElements);
    }

    public isTabGuard(element: HTMLElement, bottom?: boolean): boolean {
        return (element === this.eTopGuard && !bottom) || (element === this.eBottomGuard && (bottom ?? true));
    }

    public setAllowFocus(allowFocus: boolean): void {
        this.allowFocus = allowFocus;
    }
}
