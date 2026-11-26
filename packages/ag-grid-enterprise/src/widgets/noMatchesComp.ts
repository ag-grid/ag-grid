import { Component } from 'ag-grid-community';

import noMatchesCompCSS from './noMatchesComp.css';

export class NoMatchesComp extends Component {
    private announced = false;

    constructor(cssClass: string) {
        super({ tag: 'div', cls: `ag-no-matches ${cssClass}` });
        this.registerCSS(noMatchesCompCSS);
    }

    public postConstruct(): void {
        this.getGui().textContent = this.getLocaleTextFunc()('noMatches', 'No matches');
        this.setDisplayed(false);

        const cancelIfHidden = this.cancelIfHidden.bind(this);
        this.addManagedEventListeners({
            toolPanelVisibleChanged: cancelIfHidden,
            sideBarUpdated: cancelIfHidden,
        });
    }

    /** Only announce when user input caused the change, so data or column updates don't speak while the UI is closed. */
    public setNoMatches(noMatches: boolean, announce: boolean): void {
        this.setDisplayed(noMatches);
        if (!noMatches) {
            this.cancelAnnouncement();
        } else if (announce && !this.announced && this.isShown()) {
            this.beans.ariaAnnounce.announceValue(this.getGui().textContent ?? '', 'noMatches');
            this.announced = true;
        }
    }

    /** Drops a "No matches" still waiting out the announcement delay, e.g. when its search UI is hidden. */
    public cancelAnnouncement(): void {
        if (!this.announced) {
            return;
        }
        this.beans.ariaAnnounce.cancelAnnouncement('noMatches');
        this.announced = false;
    }

    /** A debounced search can land after its panel or popup has closed. */
    private isShown(): boolean {
        const eGui = this.getGui();
        return eGui.isConnected && !eGui.closest('.ag-hidden');
    }

    private cancelIfHidden(): void {
        if (this.isShown()) {
            return;
        }
        this.cancelAnnouncement();
    }

    public override destroy(): void {
        this.cancelAnnouncement();
        super.destroy();
    }
}
