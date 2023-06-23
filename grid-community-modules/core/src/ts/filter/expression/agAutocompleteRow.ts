import { exists } from "../../utils/generic";
import { Component } from "../../widgets/component";

export class AgAutocompleteRow extends Component {
    constructor() {
        super(/* html */`<div class="ag-rich-select-row" role="presentation"></div>`);
    }

    public setState(value: any, valueFormatted: string, selected: boolean): void {
        this.populateWithoutRenderer(value, valueFormatted);

        this.updateSelected(selected);
    }

    public updateSelected(selected: boolean): void {
        this.addOrRemoveCssClass('ag-rich-select-row-selected', selected);
    }

    private populateWithoutRenderer(value: any, valueFormatted: string) {
        const valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
        const valueToRender = valueFormattedExits ? valueFormatted : value;

        if (exists(valueToRender) && valueToRender !== '') {
            // not using innerHTML to prevent injection of HTML
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
            this.getGui().textContent = valueToRender.toString();
        } else {
            // putting in blank, so if missing, at least the user can click on it
            this.getGui().innerHTML = '&nbsp;';
        }
    }
}
