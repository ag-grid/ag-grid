import { PostConstruct } from "../context/context";
import { Component } from "./component";
import { isNodeOrElement, clearElement } from "../utils/dom";
import { ManagedFocusContainerCtrl, IManagedFocusContainer } from "./managedFocusContainerCtrl";

export class ManagedFocusContainer extends Component {

    private topTabGuard: HTMLElement;
    private bottomTabGuard: HTMLElement;
    private skipTabGuardFocus: boolean = false;
    private managedFocusContainerCtrl: ManagedFocusContainerCtrl;

    @PostConstruct
    protected postConstruct() {
        this.topTabGuard = this.createTabGuard('top');
        this.bottomTabGuard = this.createTabGuard('bottom');

        const compProxy: IManagedFocusContainer = {
            getFocusableElement: () => this.getFocusableElement(),
            tabGuardsAreActive: () => this.tabGuardsAreActive(),
            shouldStopEventPropagation: () => this.shouldStopEventPropagation(),
            onTabKeyDown: (e: KeyboardEvent) => this.onTabKeyDown(e),
            handleKeyDown: (e: KeyboardEvent) => this.handleKeyDown(e),
            onFocusIn: (e: FocusEvent) => this.onFocusIn(e),
            onFocusOut: (e: FocusEvent) => this.onFocusOut(e)
        }

        this.managedFocusContainerCtrl = this.createManagedBean(new ManagedFocusContainerCtrl());
        this.managedFocusContainerCtrl.setComp(compProxy);

        this.addTabGuards();
        this.activateTabGuards();
        this.forEachTabGuard(guard => this.addManagedListener(guard, 'focus', this.onFocus.bind(this)));
    }

    private onFocus(e: FocusEvent): void {
        if (this.skipTabGuardFocus) {
            this.skipTabGuardFocus = false;
            return;
        }

        this.focusInnerElement(e.target === this.bottomTabGuard);
    }

    protected focusInnerElement(fromBottom?: boolean) {
        return this.managedFocusContainerCtrl.focusInnerElement(fromBottom);
    }

    protected shouldStopEventPropagation(): boolean {
        return false;
    }

    protected handleKeyDown(e: KeyboardEvent): void { }

    private activateTabGuards(): void {
        this.forEachTabGuard(guard => guard.setAttribute('tabIndex', this.managedFocusContainerCtrl.getGridTabIndex()));
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

        const nextRoot = this.managedFocusContainerCtrl.getNextFocusableElement(e.shiftKey);

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