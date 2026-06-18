import { RefPlaceholder } from 'ag-stack';

import type { ComponentSelector, ElementParams, IStatusPanelValueFormatterParams } from 'ag-grid-community';
import { Component, _addGridCommonParams } from 'ag-grid-community';

const AgNameValueElement: ElementParams = {
    tag: 'div',
    cls: 'ag-status-name-value',
    children: [
        { tag: 'span', ref: 'eLabel' },
        ':\u00A0',
        { tag: 'span', ref: 'eValue', cls: 'ag-status-name-value-value' },
    ],
};

const MIN_SAFE_BIGINT = BigInt(Number.MIN_SAFE_INTEGER);
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

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

    public setValue(value: number | bigint | null, totalRows: number): void {
        let numericValue: number | null = null;
        let bigintValue: bigint | undefined;

        if (typeof value === 'bigint') {
            bigintValue = value;
            if (value >= MIN_SAFE_BIGINT && value <= MAX_SAFE_BIGINT) {
                numericValue = Number(value);
            }
        } else {
            numericValue = value;
        }

        this.eValue.textContent = this.valueFormatter(
            _addGridCommonParams(this.gos, {
                value: numericValue,
                bigintValue,
                totalRows,
                key: this.key,
            })
        );
    }
}
export const AgNameValueSelector: ComponentSelector = {
    selector: 'AG-NAME-VALUE',
    component: AgNameValue,
};
