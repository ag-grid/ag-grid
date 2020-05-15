import { PostConstruct } from "../context/context";
import { Component } from "./component";
import { Constants } from "../constants";

export class ManagedFocusComponent extends Component {

    protected onTabKeyDown(e: KeyboardEvent): void {
        e.preventDefault();
    }

    protected onFocusIn(e: FocusEvent): void { }

    protected onFocusOut(e: FocusEvent): void { }

    protected handleKeyDown(e: KeyboardEvent): void { }

    @PostConstruct
    private attachListenersToGui(): void {
        const eGui = this.getGui();

        if (!eGui) { return; }

        this.addManagedListener(eGui, 'keydown', (e: KeyboardEvent) => {
            if (e.keyCode === Constants.KEY_TAB) {
                this.onTabKeyDown(e);
            } else {
                this.handleKeyDown(e);
            }
        });

        this.addManagedListener(eGui, 'focusin', this.onFocusIn.bind(this));
        this.addManagedListener(eGui, 'focusout', this.onFocusOut.bind(this));
    }
}
