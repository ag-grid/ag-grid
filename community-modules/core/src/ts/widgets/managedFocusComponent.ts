import { PostConstruct, Autowired } from '../context/context';
import { Component } from './component';
import { Constants } from '../constants';
import { FocusController } from '../focusController';
import { isNodeOrElement, addCssClass, clearElement } from '../utils/dom';

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
export class ManagedFocusComponent extends Component {

    protected onTabKeyDown?(e: KeyboardEvent): void;
    protected handleKeyDown?(e: KeyboardEvent): void;

    public static FOCUS_MANAGED_CLASS = 'ag-focus-managed';

    private topTabGuard: HTMLElement;
    private bottomTabGuard: HTMLElement;
    private skipTabGuardFocus: boolean = false;

    @Autowired('focusController') protected readonly focusController: FocusController;

    /*
     * Set isFocusableContainer to true if this component will contain multiple focus-managed
     * elements within. When set to true, this component will add tabGuards that will be responsible
     * for receiving focus from outside and focusing an internal element using the focusInnerElementMethod
     */
    constructor(template?: string, private readonly isFocusableContainer = false) {
        super(template);
    }

    @PostConstruct
    protected postConstruct(): void {
        if (!this.getFocusableElement()) { return; }

        this.wireFocusManagement();
    }

    protected wireFocusManagement() {
        const focusableElement = this.getFocusableElement();

        addCssClass(focusableElement, ManagedFocusComponent.FOCUS_MANAGED_CLASS);

        if (this.isFocusableContainer) {
            this.topTabGuard = this.createTabGuard('top');
            this.bottomTabGuard = this.createTabGuard('bottom');
            this.addTabGuards();
            this.activateTabGuards();
            this.forEachTabGuard(guard => this.addManagedListener(guard, 'focus', this.onFocus.bind(this)));
        }

        if (this.onTabKeyDown || this.handleKeyDown) {
            this.addKeyDownListeners(focusableElement);
        }

        this.addManagedListener(focusableElement, 'focusin', this.onFocusIn.bind(this));
        this.addManagedListener(focusableElement, 'focusout', this.onFocusOut.bind(this));
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
        if (!this.isFocusableContainer) { return; }

        this.deactivateTabGuards();
    }

    protected onFocusOut(e: FocusEvent): void {
        if (!this.isFocusableContainer) { return; }

        if (!this.getFocusableElement().contains(e.relatedTarget as HTMLElement)) {
            this.activateTabGuards();
        }
    }

    public forceFocusOutOfContainer(): void {
        this.activateTabGuards();

        this.skipTabGuardFocus = true;
        this.bottomTabGuard.focus();
    }

    public appendChild(newChild: HTMLElement | Component, container?: HTMLElement): void {
        if (!this.isFocusableContainer) {
            super.appendChild(newChild, container);
        } else {
            if (!isNodeOrElement(newChild)) {
                newChild = (newChild as Component).getGui();
            }

            const bottomTabGuard = this.bottomTabGuard;

            if (bottomTabGuard) {
                bottomTabGuard.insertAdjacentElement('beforebegin', newChild as HTMLElement);
            } else {
                super.appendChild(newChild, container);
            }
        }
    }

    private createTabGuard(side: 'top' | 'bottom'): HTMLElement {
        const tabGuard = document.createElement('div');
        tabGuard.classList.add('ag-tab-guard', `ag-tab-guard-${side}`);
        tabGuard.setAttribute('role', 'presentation');

        return tabGuard;
    }

    private addTabGuards(): void {
        const focusableEl = this.getFocusableElement();

        focusableEl.insertAdjacentElement('afterbegin', this.topTabGuard);
        focusableEl.insertAdjacentElement('beforeend', this.bottomTabGuard);
    }

    private forEachTabGuard(callback: (tabGuard: HTMLElement) => void) {
        [this.topTabGuard, this.bottomTabGuard].forEach(callback);
    }

    private addKeyDownListeners(eGui: HTMLElement): void {
        this.addManagedListener(eGui, 'keydown', (e: KeyboardEvent) => {
            if (e.defaultPrevented) { return; }

            if (e.keyCode === Constants.KEY_TAB && this.onTabKeyDown) {
                this.onTabKeyDown(e);
            } else if (this.handleKeyDown) {
                this.handleKeyDown(e);
            }
        });
    }

    private onFocus(e: FocusEvent): void {
        if (!this.isFocusableContainer) { return; }

        if (this.skipTabGuardFocus) {
            this.skipTabGuardFocus = false;
            return;
        }

        this.focusInnerElement(e.target === this.bottomTabGuard);
    }

    private activateTabGuards(): void {
        this.forEachTabGuard(guard => guard.setAttribute('tabIndex', '0'));
    }

    private deactivateTabGuards(): void {
        this.forEachTabGuard(guard => guard.removeAttribute('tabIndex'));
    }
}
