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
    }

    /** Only announce when user input caused the change, so data or column updates don't speak while the UI is closed. */
    public setNoMatches(noMatches: boolean, announce: boolean): void {
        const { ariaAnnounce } = this.beans;
        if (noMatches && announce && !this.announced) {
            ariaAnnounce.announceValue(this.getGui().textContent ?? '', 'noMatches');
        } else if (!noMatches && this.announced) {
            // An empty same-key value supersedes one still waiting out the announcement delay.
            ariaAnnounce.announceValue('', 'noMatches');
        }
        this.announced = noMatches && (announce || this.announced);
        this.setDisplayed(noMatches);
    }
}
