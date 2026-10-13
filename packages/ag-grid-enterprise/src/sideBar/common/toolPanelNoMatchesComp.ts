import { Component } from 'ag-grid-community';

export class ToolPanelNoMatchesComp extends Component {
    constructor(cssClass: string) {
        super({ tag: 'div', cls: cssClass });
    }

    public postConstruct(): void {
        this.getGui().textContent = this.getLocaleTextFunc()('noMatches', 'No matches');
        this.setDisplayed(false);
    }

    public setNoMatches(noMatches: boolean): void {
        if (noMatches && !this.isDisplayed()) {
            this.beans.ariaAnnounce.announceValue(this.getGui().textContent ?? '', 'toolPanelNoMatches');
        }
        this.setDisplayed(noMatches);
    }
}
