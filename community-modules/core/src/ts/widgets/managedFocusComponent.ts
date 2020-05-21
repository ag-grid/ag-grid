import { PostConstruct } from "../context/context";
import { Component } from "./component";
import { Constants } from "../constants";

export class ManagedFocusComponent extends Component {

    protected onTabKeyDown?(e: KeyboardEvent): void;
    protected handleKeyDown?(e: KeyboardEvent): void;

    protected onFocusIn?(e: FocusEvent): void;
    protected onFocusOut?(e: FocusEvent): void;

    @PostConstruct
    protected postConstruct(): void {
        const eGui = this.getGui();

        if (!eGui) { return; }

        if (this.onTabKeyDown || this.handleKeyDown) {
            this.addKeyDownListeners(eGui);
        }

        if (this.onFocusIn) {
            this.addManagedListener(eGui, 'focusin', this.onFocusIn.bind(this));
        }

        if (this.onFocusOut) {
            this.addManagedListener(eGui, 'focusout', this.onFocusOut.bind(this));
        }
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
}
