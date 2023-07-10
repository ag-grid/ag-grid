import { exists } from "../../utils/generic";
import { Component } from "../../widgets/component";

export class AgAutocompleteRow extends Component {
    constructor() {
        super(/* html */`<div class="ag-rich-select-row" role="presentation"></div>`);
    }

    public setState(value: string, selected: boolean): void {
        this.populateWithoutRenderer(value);

        this.updateSelected(selected);
    }

    public updateSelected(selected: boolean): void {
        this.addOrRemoveCssClass('ag-rich-select-row-selected', selected);
    }

    private populateWithoutRenderer(value: string) {
        if (exists(value) && value !== '') {
            // not using innerHTML to prevent injection of HTML
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
            this.getGui().textContent = value.toString();
        } else {
            // putting in blank, so if missing, at least the user can click on it
            this.getGui().innerHTML = '&nbsp;';
        }
    }
}
