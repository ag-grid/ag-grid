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
        if (exists(searchString) && this.value?.toLocaleLowerCase().startsWith(searchString.toLocaleLowerCase())) {
            this.hasHighlighting = true;
            this.getGui().lastElementChild!.innerHTML = `<b>${escapeString(this.value.slice(0, searchString.length))}</b>${escapeString(this.value.slice(searchString.length))}`;
        } else if (this.hasHighlighting) {
            this.hasHighlighting = false;
            this.render();
        }
    }

    private render() {
        // putting in blank if missing, so at least the user can click on it
        this.getGui().lastElementChild!.innerHTML = escapeString(this.value) ?? '&nbsp;';
    }
}
