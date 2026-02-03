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

    public setValue(value: number | bigint | null, totalRows: number): void {
        let numericValue: number | null = null;
        let bigintValue: bigint | undefined;

        if (typeof value === 'bigint') {
            bigintValue = value;
            const minSafe = BigInt(Number.MIN_SAFE_INTEGER);
            const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
            if (value >= minSafe && value <= maxSafe) {
                numericValue = Number(value);
            }
        } else {
            numericValue = value;
        }

        const formattedValue = this.valueFormatter(
            _addGridCommonParams(this.gos, {
                value: numericValue,
                bigintValue,
                totalRows,
                key: this.key,
            })
        );

        this.eValue.textContent = formattedValue;
    }
}
export const AgNameValueSelector: ComponentSelector = {
    selector: 'AG-NAME-VALUE',
    component: AgNameValue,
};
