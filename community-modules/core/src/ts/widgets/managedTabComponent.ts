import { PostConstruct } from "../context/context";
import { Component } from "./component";
import { Constants } from "../constants";

export class ManagedTabComponent extends Component {
    private tabListener: () => null;

    protected onTabKeyDown(e: KeyboardEvent): void {
        e.preventDefault();
    }

    @PostConstruct
    private attachListenersToGui(): void {
        const eGui = this.getGui();

        if (!eGui) { return; }

        if (this.tabListener) {
            this.tabListener = this.tabListener();
        }

        this.tabListener = this.addManagedListener(eGui, 'keydown', (e: KeyboardEvent) => {
            if (e.keyCode === Constants.KEY_TAB) {
                this.onTabKeyDown(e);
            }
        });
    }
}
