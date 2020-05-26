import { PostConstruct, Autowired } from "../context/context";
import { Component } from "./component";
import { Constants } from "../constants";
import { FocusController } from "../focusController";
import { _ } from "../utils";

export class ManagedFocusComponent extends Component {

    protected onTabKeyDown?(e: KeyboardEvent): void;
    protected handleKeyDown?(e: KeyboardEvent): void;

    public static FOCUS_MANAGED_CLASS = 'ag-focus-managed';
    private tabGuards: HTMLElement[] = [];

    @Autowired('focusController') protected focusController: FocusController;

    @PostConstruct
    protected postConstruct(): void {
        const focusableElement = this.getFocusableElement();
        if (!focusableElement) { return; }

        this.wireFocusManagement();
    }

    protected wireFocusManagement(highPriorityTab?: boolean) {
        const focusableElement = this.getFocusableElement();

        _.addCssClass(focusableElement, ManagedFocusComponent.FOCUS_MANAGED_CLASS);

        if (this.isFocusableContainer()) {
            this.createTabGuards().addTabGuards();
            this.activateTabGuards();
            this.forEachTabGuard(tabGuards => {
                this.addManagedListener(tabGuards, 'focus', this.onFocus.bind(this));
            });
        }

        if (this.onTabKeyDown || this.handleKeyDown) {
            this.addKeyDownListeners(focusableElement, highPriorityTab);
        }

        this.addManagedListener(focusableElement, 'focusin', this.onFocusIn.bind(this));
        this.addManagedListener(focusableElement, 'focusout', this.onFocusOut.bind(this));
    }

    /*
     * Override this method to return true if this component will contain multiple focus-managed
     * elements within. When set to true, this component will add tabGuards that will be responsible
     * for receiving focus from outside and focusing an internal element using the focusInnerElementMethod
     */
    protected isFocusableContainer(): boolean {
        return false;
    }

    /*
     * Override this method if focusing the default element requires special logic.
     */
    protected focusInnerElement(fromBottom?: boolean): void {
        const focusable = this.focusController.findFocusableElements(this.getFocusableElement(), '.ag-tab-guard, :not([tabindex="-1"])');

        if (!focusable.length) { return; }

        focusable[fromBottom ? focusable.length - 1 : 0].focus();
    }

    protected onFocusIn(e: FocusEvent): void {
        if (!this.isFocusableContainer()) { return; }

        this.deactivateTabGuards();
    }

    protected onFocusOut(e: FocusEvent): void {
        if (!this.isFocusableContainer()) { return; }

        const focusEl = this.getFocusableElement();

        if (!focusEl.contains(e.relatedTarget as HTMLElement)) {
            this.activateTabGuards();
        }
    }

    protected getTabGuards(): HTMLElement[] {
        return this.tabGuards;
    }

    public appendChild(newChild: HTMLElement | Component, container?: HTMLElement): void {
        if (!this.isFocusableContainer()) {
            super.appendChild(newChild, container);
        } else {
            const tabGuards = this.getTabGuards();

            if (!_.isNodeOrElement(newChild)) {
                newChild = (newChild as Component).getGui();
            }

            if (tabGuards.length) {
                _.last(tabGuards).insertAdjacentElement('beforebegin', newChild as HTMLElement);
            } else {
                super.appendChild(newChild, container);
            }
        }
    }

    private createTabGuards(): this {
        this.tabGuards = ['top', 'bottom'].map(side => {
            const tabGuard = document.createElement('div');
            tabGuard.classList.add('ag-tab-guard');
            tabGuard.classList.add(`ag-tab-guard-${side}`);

            return tabGuard as HTMLElement;
        });

        return this;
    }

    private addTabGuards(): void {
        const focusableEl = this.getFocusableElement();
        focusableEl.insertAdjacentElement('afterbegin', this.tabGuards[0]);
        focusableEl.insertAdjacentElement('beforeend', this.tabGuards[1]);
    }

    private forEachTabGuard(callback: (tabGuard: HTMLElement) => void) {
        this.tabGuards.forEach(callback);
    }

    private addKeyDownListeners(eGui: HTMLElement, isCapture?: boolean): void {
        this.addManagedListener(eGui, 'keydown', (e: KeyboardEvent) => {
            if (e.defaultPrevented) { return; }

            if (e.keyCode === Constants.KEY_TAB && this.onTabKeyDown) {
                this.onTabKeyDown(e);
            } else if (this.handleKeyDown) {
                this.handleKeyDown(e);
            }
        }, {
            capture: isCapture ? true : undefined
        });
    }

    private onFocus(e: FocusEvent): void {
        if (!this.isFocusableContainer()) { return; }

        this.focusInnerElement(e.target === this.tabGuards[1]);
    }

    private activateTabGuards(): void {
        this.forEachTabGuard(tabGuard => tabGuard.setAttribute('tabIndex', '0'));
    }

    private deactivateTabGuards(): void {
        this.forEachTabGuard(tabGuards => tabGuards.removeAttribute('tabindex'));
    }
}
