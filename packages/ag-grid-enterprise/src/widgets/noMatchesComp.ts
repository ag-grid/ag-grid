import { Component } from 'ag-grid-community';

export class NoMatchesComp extends Component {
    private announced = false;

    constructor(cssClass: string) {
        super({ tag: 'div', cls: cssClass });
    }

    public postConstruct(): void {
        this.getGui().textContent = this.getLocaleTextFunc()('noMatches', 'No matches');
        this.setDisplayed(false);
    }

    /** Only announce when user input caused the change, so data or column updates don't speak while the UI is closed. */
    public setNoMatches(noMatches: boolean, announce: boolean): void {
        if (noMatches && announce && !this.announced) {
            this.beans.ariaAnnounce.announceValue(this.getGui().textContent ?? '', 'noMatches');
        }
        this.announced = noMatches && (announce || this.announced);
        this.setDisplayed(noMatches);
    }
}
