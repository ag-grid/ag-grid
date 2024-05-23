import type { AgComponentSelector } from '@ag-grid-community/core';
import { Component, RefPlaceholder } from '@ag-grid-community/core';

export class AgNameValue extends Component {
    static readonly selector: AgComponentSelector = 'AG-NAME-VALUE';

    private static TEMPLATE /* html */ = `<div class="ag-status-name-value">
            <span data-ref="eLabel"></span>:&nbsp;
            <span data-ref="eValue" class="ag-status-name-value-value"></span>
        </div>`;

    private readonly eLabel: HTMLElement = RefPlaceholder;
    private readonly eValue: HTMLElement = RefPlaceholder;

    constructor() {
        super(AgNameValue.TEMPLATE);
    }

    public setLabel(key: string, defaultValue: string): void {
        // we want to hide until the first value comes in
        this.setDisplayed(false);

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eLabel.innerHTML = localeTextFunc(key, defaultValue);
    }

    public setValue(value: any): void {
        this.eValue.innerHTML = value;
    }
}
