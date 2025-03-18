import type { ComponentSelector, IStatusPanelValueFormatterParams } from 'ag-grid-community';
import { Component, RefPlaceholder, _addGridCommonParams } from 'ag-grid-community';

export class AgNameValue extends Component {
    private readonly eLabel: HTMLElement = RefPlaceholder;
    private readonly eValue: HTMLElement = RefPlaceholder;
    public valueFormatter: (params: IStatusPanelValueFormatterParams) => string;

    public key: string;

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

    public setValue(value: number, totalRows: number): void {
        this.eValue.textContent = this.valueFormatter(
            _addGridCommonParams(this.gos, { value, totalRows, key: this.key })
        );
    }
}
export const AgNameValueSelector: ComponentSelector = {
    selector: 'AG-NAME-VALUE',
    component: AgNameValue,
};
