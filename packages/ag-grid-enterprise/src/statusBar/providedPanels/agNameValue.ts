import type { ComponentSelector } from 'ag-grid-community';
import { Component, RefPlaceholder } from 'ag-grid-community';

export class AgNameValue extends Component {
    private readonly eLabel: HTMLElement = RefPlaceholder;
    private readonly eValue: HTMLElement = RefPlaceholder;

    constructor() {
        super(/* html */ `<div class="ag-status-name-value">
            <span data-ref="eLabel"></span>:&nbsp;
            <span data-ref="eValue" class="ag-status-name-value-value"></span>
        </div>`);
    }

    public setLabel(key: string, defaultValue: string): void {
        // we want to hide until the first value comes in
        this.setDisplayed(false);

        const localeTextFunc = this.getLocaleTextFunc();
        this.eLabel.innerHTML = localeTextFunc(key, defaultValue);
    }

    public setValue(value: any): void {
        this.eValue.innerHTML = value;
    }
}
export const AgNameValueSelector: ComponentSelector = {
    selector: 'AG-NAME-VALUE',
    component: AgNameValue,
};
