import { PostConstruct, Autowired } from "../context/context";
import { Component } from "./component";
import { Constants } from "../constants";
import { _ } from "../utils";

export class ManagedFocusComponent extends Component {

    protected onTabKeyDown?(e: KeyboardEvent): void;
    protected handleKeyDown?(e: KeyboardEvent): void;
    protected focusFirstElement?(): void;

    private focusableContainer: boolean;

    @PostConstruct
    protected postConstruct(): void {
        const focusableElement = this.getFocusableElement();
        if (!focusableElement) { return; }

        if (focusableElement && _.getTabIndex(focusableElement) === '0') {
            this.focusableContainer = true;
        }

        if (this.onTabKeyDown || this.handleKeyDown) {
            this.addKeyDownListeners(focusableElement);
        }

        this.addManagedListener(focusableElement, 'focus', this.onFocus.bind(this));
        this.addManagedListener(focusableElement, 'blur', this.onBlur.bind(this));
        this.addManagedListener(focusableElement, 'focusin', this.onFocusIn.bind(this));
        this.addManagedListener(focusableElement, 'focusout', this.onFocusOut.bind(this));

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

    protected onFocusIn(e: FocusEvent): void {
        if (!this.focusableContainer) { return; }

        const focusEl = this.getFocusableElement();

        focusEl.setAttribute('tabindex', '-1');
    }

    protected onFocusOut(e: FocusEvent): void {
        if (!this.focusableContainer) { return; }

        const focusEl = this.getFocusableElement();

        if (!focusEl.contains(e.relatedTarget as HTMLElement)) {
            focusEl.setAttribute('tabindex', '0');
        }
    }

    protected onFocus(e: FocusEvent): void {
        if (!this.focusableContainer || !this.focusFirstElement) { return; }
        this.focusFirstElement();
    }

    protected onBlur(e: FocusEvent): void {

    }
}
