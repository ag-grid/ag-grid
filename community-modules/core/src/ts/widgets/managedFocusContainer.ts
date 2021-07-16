import { PostConstruct, Autowired } from "../context/context";
import { Component } from "./component";
import { FocusService } from "../focusService";
import { isNodeOrElement, clearElement } from "../utils/dom";
import { ManagedFocusFeature } from "./managedFocusFeature";

export class ManagedFocusContainer extends Component {

    @Autowired('focusService') protected focusService: FocusService;

    private topTabGuard: HTMLElement;
    private bottomTabGuard: HTMLElement;
    private skipTabGuardFocus: boolean = false;

    @PostConstruct
    protected postConstruct() {
        this.topTabGuard = this.createTabGuard('top');
        this.bottomTabGuard = this.createTabGuard('bottom');
        this.addTabGuards();
        this.activateTabGuards();
        this.forEachTabGuard(guard => this.addManagedListener(guard, 'focus', this.onFocus.bind(this)));
        this.createManagedBean(new ManagedFocusFeature(
            this.getFocusableElement(),
            this.shouldStopEventPropagation.bind(this),
            this.onTabKeyDown.bind(this),
            this.handleKeyDown.bind(this),
            this.onFocusIn.bind(this),
            this.onFocusOut.bind(this)
        ));
    }

    private onFocus(e: FocusEvent): void {
        if (this.skipTabGuardFocus) {
            this.skipTabGuardFocus = false;
            return;
        }

        this.focusInnerElement(e.target === this.bottomTabGuard);
    }

    protected shouldStopEventPropagation(): boolean {
        return false;
    }

    protected handleKeyDown(e: KeyboardEvent): void {

    }

    protected focusInnerElement(fromBottom = false): void {
        const focusable = this.focusService.findFocusableElements(this.getFocusableElement());
    
        if (this.tabGuardsAreActive()) {
            // remove tab guards from this component from list of focusable elements
            focusable.splice(0, 1);
            focusable.splice(focusable.length - 1, 1);
        }
    
        if (!focusable.length) { return; }
    
        focusable[fromBottom ? focusable.length - 1 : 0].focus();
    }
    
    private activateTabGuards(): void {
        this.forEachTabGuard(guard => guard.setAttribute('tabIndex', this.gridOptionsWrapper.getGridTabIndex()));
    }
    
    private deactivateTabGuards(): void {
        this.forEachTabGuard(guard => guard.removeAttribute('tabIndex'));
    }
    
    private tabGuardsAreActive(): boolean {
        return !!this.topTabGuard && this.topTabGuard.hasAttribute('tabIndex');
    }
    
    protected onFocusIn(e: FocusEvent): void {
        this.deactivateTabGuards();
    }
    
    protected onFocusOut(e: FocusEvent): void {
        if (!this.getFocusableElement().contains(e.relatedTarget as HTMLElement)) {
            this.activateTabGuards();
        }
    }
    
    public forceFocusOutOfContainer(up = false): void {
        this.activateTabGuards();
        this.skipTabGuardFocus = true;
    
        const tabGuardToFocus = up ? this.topTabGuard : this.bottomTabGuard;
    
        if (tabGuardToFocus) { tabGuardToFocus.focus(); }
    }
    
    /**
     * By default this will tab though the elements in the default order. Override if you require special logic.
     */
    protected onTabKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) { return; }

        const tabGuardsAreActive = this.tabGuardsAreActive();

        if (tabGuardsAreActive) {
            this.deactivateTabGuards();
        }

        const nextRoot = this.focusService.findNextFocusableElement(this.getFocusableElement(), false, e.shiftKey);

        if (tabGuardsAreActive) {
            // ensure the tab guards are only re-instated once the event has finished processing, to avoid the browser
            // tabbing to the tab guard from inside the component
            setTimeout(() => this.activateTabGuards(), 0);
        }

        if (!nextRoot) { return; }

        nextRoot.focus();
        e.preventDefault();
    }

    public appendChild(newChild: HTMLElement | Component, container?: HTMLElement): void {
        if (!isNodeOrElement(newChild)) {
            newChild = (newChild as Component).getGui();
        }

        const { bottomTabGuard } = this;

        if (bottomTabGuard) {
            bottomTabGuard.insertAdjacentElement('beforebegin', newChild as HTMLElement);
        } else {
            super.appendChild(newChild, container);
        }
    }

    private createTabGuard(side: 'top' | 'bottom'): HTMLElement {
        const tabGuard = document.createElement('div');

        tabGuard.classList.add('ag-tab-guard');
        tabGuard.classList.add(`ag-tab-guard-${side}`);
        tabGuard.setAttribute('role', 'presentation');

        return tabGuard;
    }

    private addTabGuards(): void {
        const focusableEl = this.getFocusableElement();

        focusableEl.insertAdjacentElement('afterbegin', this.topTabGuard);
        focusableEl.insertAdjacentElement('beforeend', this.bottomTabGuard);
    }

    private forEachTabGuard(callback: (tabGuard: HTMLElement) => void) {
        if (this.topTabGuard) { callback(this.topTabGuard); }
        if (this.bottomTabGuard) { callback(this.bottomTabGuard); }
    }

    protected clearFocusableElement(): void {
        const tabGuardsAreActive = this.tabGuardsAreActive();

        clearElement(this.getFocusableElement());

        this.addTabGuards();

        if (tabGuardsAreActive) {
            this.activateTabGuards();
        }
    }
}