import { BeanStub } from "../context/beanStub";
import { PostConstruct } from "../context/context";

export enum TabGuardClassNames {
    TAB_GUARD = 'ag-tab-guard',
    TAB_GUARD_TOP = 'ag-tab-guard-top',
    TAB_GUARD_BOTTOM = 'ag-tab-guard-bottom'
};

export interface ITabGuard {
    setTabIndex(tabIndex?: string): void;
}

export class TabGuardCtrl extends BeanStub {

    private readonly comp: ITabGuard;
    private readonly eTopGuard: HTMLElement;
    private readonly eBottomGuard: HTMLElement;

    private readonly eFocusableElement: HTMLElement;
    private readonly focusTrapActive: boolean;
    private readonly forceFocusOutWhenTabGuardsAreEmpty: boolean;

    private readonly providedFocusInnerElement?: (fromBottom: boolean) => void;
    private readonly providedFocusIn?: (event: FocusEvent) => void;
    private readonly providedFocusOut?: (event: FocusEvent) => void;

    private readonly providedShouldStopEventPropagation?: () => boolean;
    private readonly providedOnTabKeyDown?: (e: KeyboardEvent) => void;
    private readonly providedHandleKeyDown?: (e: KeyboardEvent) => void;

    private skipTabGuardFocus: boolean = false;
    private forcingFocusOut: boolean = false;

    constructor(params: {
        comp: ITabGuard,
        eTopGuard: HTMLElement,
        eBottomGuard: HTMLElement,
        eFocusableElement: HTMLElement,
        focusTrapActive?: boolean,
        forceFocusOutWhenTabGuardsAreEmpty?: boolean;
        focusInnerElement?: (fromBottom: boolean) => void,
        onFocusIn?: (event: FocusEvent) => void,
        onFocusOut?: (event: FocusEvent) => void,
        shouldStopEventPropagation?: () => boolean,
        onTabKeyDown?: (e: KeyboardEvent) => void,
        handleKeyDown?: (e: KeyboardEvent) => void
    }) {
        super();

        const {
            comp,
            eTopGuard,
            eBottomGuard,
            focusTrapActive,
            forceFocusOutWhenTabGuardsAreEmpty,
            focusInnerElement,
            onFocusIn,
            onFocusOut,
            shouldStopEventPropagation,
            onTabKeyDown,
            handleKeyDown,
            eFocusableElement
        } = params;

        this.comp = comp;

        this.eTopGuard = eTopGuard;
        this.eBottomGuard = eBottomGuard;
        this.providedFocusInnerElement = focusInnerElement;
        this.eFocusableElement = eFocusableElement;
        this.focusTrapActive = !!focusTrapActive;
        this.forceFocusOutWhenTabGuardsAreEmpty = !!forceFocusOutWhenTabGuardsAreEmpty

        this.providedFocusIn = onFocusIn;
        this.providedFocusOut = onFocusOut;
        this.providedShouldStopEventPropagation = shouldStopEventPropagation;
        this.providedOnTabKeyDown = onTabKeyDown;
        this.providedHandleKeyDown = handleKeyDown;
    }

    @PostConstruct
    private postConstruct() {


        this.activateTabGuards();

        [this.eTopGuard, this.eBottomGuard].forEach(
            guard => this.addManagedListener(guard, 'focus', this.onFocus.bind(this))
        );
    }

    private tabGuardsAreActive(): boolean {
        return !!this.eTopGuard && this.eTopGuard.hasAttribute('tabIndex');
    }


    private activateTabGuards(): void {
        // Do not activate tabs while focus is being forced out
        if (this.forcingFocusOut) { return; }
        const tabIndex = this.gos.get('tabIndex');
        this.comp.setTabIndex(tabIndex.toString());
    }

    private deactivateTabGuards(): void {
        this.comp.setTabIndex();
    }

    private onFocus(e: FocusEvent): void {
        if (this.skipTabGuardFocus) {
            this.skipTabGuardFocus = false;
            return;
        }

        // when there are no focusable items within the TabGuard, focus gets stuck
        // in the TabGuard itself and has nowhere to go, so we need to manually find
        // the closest element to focus by calling `forceFocusOutWhenTabGuardAreEmpty`.
        if (this.forceFocusOutWhenTabGuardsAreEmpty) {
                return;
        }

        const fromBottom = e.target === this.eBottomGuard;

        if (this.providedFocusInnerElement) {
            this.providedFocusInnerElement(fromBottom);
        } else {
            this.focusInnerElement(fromBottom);
        }
    }


    public onTabKeyDown(e: KeyboardEvent): void {
        if (this.providedOnTabKeyDown) {
            this.providedOnTabKeyDown(e);
            return;
        }

        if (this.focusTrapActive) { return; }
        if (e.defaultPrevented) { return; }

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

        if (!nextRoot) { return; }

        nextRoot.focus();
        e.preventDefault();
    }

    public focusInnerElement(fromBottom = false): void {
        const focusable: any[] = [];
        if (this.tabGuardsAreActive()) {
            // remove tab guards from this component from list of focusable elements
            focusable.splice(0, 1);
            focusable.splice(focusable.length - 1, 1);
        }

        if (!focusable.length) { return; }

        focusable[fromBottom ? focusable.length - 1 : 0].focus({ preventScroll: true });
    }

    public getNextFocusableElement(backwards?: boolean): HTMLElement | null {
        return null;
    }

    public forceFocusOutOfContainer(up: boolean = false): void {
        // avoid multiple calls to `forceFocusOutOfContainer`
        if (this.forcingFocusOut) { return; }

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

    public isTabGuard(element: HTMLElement): boolean {
        return element === this.eTopGuard || element === this.eBottomGuard;
    }
}
