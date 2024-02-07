import { escapeString } from "../utils/string";
import { exists } from "../utils/generic";
import { Component } from "./component";

export class AgAutocompleteRow extends Component {
    private value: string;
    private hasHighlighting = false;

    constructor() {
        super(/* html */`
        <div class="ag-autocomplete-row" role="presentation">
            <div class="ag-autocomplete-row-label"></div>
        </div>`);
    }

    public setState(value: string, selected: boolean): void {
        this.value = value;

        this.render();

        this.updateSelected(selected);
    }

    public updateSelected(selected: boolean): void {
        this.addOrRemoveCssClass('ag-autocomplete-row-selected', selected);
    }

    public setSearchString(searchString: string): void {
        let keepHighlighting = false;
        if (exists(searchString)) {
            const index = this.value?.toLocaleLowerCase().indexOf(searchString.toLocaleLowerCase());
            if (index >= 0) {
                keepHighlighting = true;
                this.hasHighlighting = true;
                const highlightEndIndex = index + searchString.length;
                const startPart = escapeString(this.value.slice(0, index));
                const highlightedPart = escapeString(this.value.slice(index, highlightEndIndex));
                const endPart = escapeString(this.value.slice(highlightEndIndex));
                this.getGui().lastElementChild!.innerHTML = `${startPart}<b>${highlightedPart}</b>${endPart}`;
            }
        }
        if (!keepHighlighting && this.hasHighlighting) {
            this.hasHighlighting = false;
            this.render();
        }
    }

    private render() {
        // putting in blank if missing, so at least the user can click on it
        this.getGui().lastElementChild!.innerHTML = escapeString(this.value) ?? '&nbsp;';
    }
}
