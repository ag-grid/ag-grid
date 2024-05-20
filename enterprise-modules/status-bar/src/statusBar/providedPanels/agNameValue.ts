import { AgComponentSelector, Component, RefSelector } from '@ag-grid-community/core';

export class AgNameValue extends Component {
    static readonly selector: AgComponentSelector = 'ag-name-value';

    private static TEMPLATE /* html */ = `<div class="ag-status-name-value">
            <span ref="eLabel"></span>:&nbsp;
            <span ref="eValue" class="ag-status-name-value-value"></span>
        </div>`;

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('eValue') private eValue: HTMLElement;

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
