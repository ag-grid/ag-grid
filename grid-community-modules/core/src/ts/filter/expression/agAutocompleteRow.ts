import { escapeString } from "../../utils/string";
import { exists } from "../../utils/generic";
import { Component } from "../../widgets/component";

export class AgAutocompleteRow extends Component {
    private value: string;
    private hasHighlighting = false;

    constructor() {
        super(/* html */`<div class="ag-rich-select-row" role="presentation"></div>`);
    }

    public setState(value: string, selected: boolean): void {
        this.value = value;

        this.render();

        this.updateSelected(selected);
    }

    public updateSelected(selected: boolean): void {
        this.addOrRemoveCssClass('ag-rich-select-row-selected', selected);
    }

    public setSearchString(searchString: string): void {
        if (exists(searchString) && this.value?.toLocaleLowerCase().startsWith(searchString.toLocaleLowerCase())) {
            this.hasHighlighting = true;
            this.getGui().innerHTML = `<b>${escapeString(this.value.slice(0, searchString.length))}</b>${escapeString(this.value.slice(searchString.length))}`;
        } else if (this.hasHighlighting) {
            this.hasHighlighting = false;
            this.render();
        }
    }

    private render() {
        // putting in blank, so if missing, at least the user can click on it
        this.getGui().innerHTML = escapeString(this.value) ?? '&nbsp;';
    }
}
