import type { ComponentSelector, ElementParams, IStatusPanelValueFormatterParams } from 'ag-grid-community';
import { Component, RefPlaceholder, _addGridCommonParams } from 'ag-grid-community';

const AgNameValueElement: ElementParams = {
    tag: 'div',
    cls: 'ag-status-name-value',
    children: [
        { tag: 'span', ref: 'eLabel' },
        ':\u00A0',
        { tag: 'span', ref: 'eValue', cls: 'ag-status-name-value-value' },
    ],
};
export class AgNameValue extends Component {
    private readonly eLabel: HTMLElement = RefPlaceholder;
    private readonly eValue: HTMLElement = RefPlaceholder;
    public valueFormatter: (params: IStatusPanelValueFormatterParams) => string;

    public key: string;

    constructor() {
        super(AgNameValueElement);
    }

    public setLabel(key: string, defaultValue: string): void {
        // we want to hide until the first value comes in
        this.setDisplayed(false);

        this.eLabel.textContent = this.getLocaleTextFunc()(key, defaultValue);
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
