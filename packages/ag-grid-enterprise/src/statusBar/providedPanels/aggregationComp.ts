import type { LocaleTextFunc } from 'ag-stack';
import { RefPlaceholder, _exists, _missing, _parseBigIntOrNull } from 'ag-stack';

import type {
    AgColumn,
    AggregationStatusPanelAggFunc,
    AggregationStatusPanelParams,
    ElementParams,
    IStatusPanelComp,
    RowPosition,
} from 'ag-grid-community';
import {
    Component,
    _createCellId,
    _formatNumberCommas,
    _getRowBelow,
    _getRowNode,
    _isRowBefore,
} from 'ag-grid-community';

import type { AgNameValue } from './agNameValue';
import { AgNameValueSelector } from './agNameValue';
import { _getTotalRowCount } from './utils';

function _formatNumberTwoDecimalPlacesAndCommas(value: number | null, getLocaleTextFunc: () => LocaleTextFunc): string {
    if (typeof value !== 'number') {
        return '';
    }

    return _formatNumberCommas(Math.round(value * 100) / 100, getLocaleTextFunc);
}

const AggregationCompElement: ElementParams = {
    tag: 'div',
    cls: 'ag-status-panel ag-status-panel-aggregations',
    children: [
        {
            tag: 'ag-name-value',
            ref: 'avgAggregationComp',
        },
        {
            tag: 'ag-name-value',
            ref: 'countAggregationComp',
        },
        {
            tag: 'ag-name-value',
            ref: 'minAggregationComp',
        },
        {
            tag: 'ag-name-value',
            ref: 'maxAggregationComp',
        },
        {
            tag: 'ag-name-value',
            ref: 'sumAggregationComp',
        },
    ],
};
export class AggregationComp extends Component implements IStatusPanelComp {
    private readonly sumAggregationComp: AgNameValue = RefPlaceholder;
    private readonly countAggregationComp: AgNameValue = RefPlaceholder;
    private readonly minAggregationComp: AgNameValue = RefPlaceholder;
    private readonly maxAggregationComp: AgNameValue = RefPlaceholder;
    private readonly avgAggregationComp: AgNameValue = RefPlaceholder;

    private params!: AggregationStatusPanelParams;

    constructor() {
        super(AggregationCompElement, [AgNameValueSelector]);
    }

    public postConstruct(): void {
        this.avgAggregationComp.setLabel('avg', 'Average');
        this.countAggregationComp.setLabel('count', 'Count');
        this.minAggregationComp.setLabel('min', 'Min');
        this.maxAggregationComp.setLabel('max', 'Max');
        this.sumAggregationComp.setLabel('sum', 'Sum');

        this.addManagedEventListeners({
            cellSelectionChanged: this.onCellSelectionChanged.bind(this),
            modelUpdated: this.onCellSelectionChanged.bind(this),
        });
    }

    public init(params: AggregationStatusPanelParams) {
        this.refresh(params);
    }

    public refresh(params: AggregationStatusPanelParams): boolean {
        this.params = params;

        const valueFormatter =
            params.valueFormatter ??
            ((params) => {
                const { value, bigintValue } = params;
                if (bigintValue != null) {
                    return bigintValue.toString();
                }
                return _formatNumberTwoDecimalPlacesAndCommas(value, this.getLocaleTextFunc.bind(this));
            });

        const aggFuncNames: AggregationStatusPanelAggFunc[] = ['avg', 'count', 'min', 'max', 'sum'];
        for (const key of aggFuncNames) {
            const comp = this.getAllowedAggregationValueComponent(key);

            if (comp) {
                comp.key = key;
                comp.valueFormatter = valueFormatter.bind(this);
            }
        }

        this.onCellSelectionChanged();
        return true;
    }

    private setAggregationComponentValue(
        aggFuncName: AggregationStatusPanelAggFunc,
        value: number | bigint | null,
        visible: boolean
    ) {
        const statusBarValueComponent = this.getAllowedAggregationValueComponent(aggFuncName);
        const totalRow = _getTotalRowCount(this.beans.rowModel);
        if (_exists(statusBarValueComponent) && statusBarValueComponent) {
            statusBarValueComponent.setValue(value, totalRow);
            statusBarValueComponent.setDisplayed(visible);
        } else {
            // might have previously been visible, so hide now
            this.getAggregationValueComponent(aggFuncName)?.setDisplayed(false);
        }
    }

    private getAllowedAggregationValueComponent(aggFuncName: AggregationStatusPanelAggFunc): AgNameValue | null {
        // if the user has specified the agAggregationPanelComp but no aggFuncs we show the all
        // if the user has specified the agAggregationPanelComp and aggFuncs, then we only show the aggFuncs listed
        const { aggFuncs } = this.params;
        if (!aggFuncs || aggFuncs.includes(aggFuncName)) {
            return this.getAggregationValueComponent(aggFuncName);
        }

        // either we can't find it (which would indicate a typo or similar user side), or the user has deliberately
        // not listed the component in aggFuncs
        return null;
    }

    private getAggregationValueComponent(aggFuncName: AggregationStatusPanelAggFunc): AgNameValue {
        // converts user supplied agg name to our reference - eg: sum => sumAggregationComp
        const refComponentName = `${aggFuncName}AggregationComp`;
        return (this as any)[refComponentName];
    }

    /**
     * Aggregation notes:
     * - Uses bigint aggregation when bigint values are present and all numeric values are safe integers.
     * - Non-integer or unsafe integer numbers fall back to number aggregation to avoid precision loss.
     * - Avg uses integer division when bigint aggregation is active, discarding the fractional part.
     * - String values are trimmed; finite numeric strings are aggregated as numbers, while integer strings beyond the
     *   safe integer range are parsed as bigint.
     */
    private onCellSelectionChanged(): void {
        const beans = this.beans;
        const valueSvc = beans.valueSvc;
        const formulaSvc = beans.formula;
        const rangeSvc = beans.rangeSvc;
        const cellRanges = rangeSvc?.getCellRanges();

        let sum = 0;
        let sumBigint = 0n;
        let hasBigInt = false;
        let seenNonInteger = false;
        let count = 0;
        let numericCount = 0;
        let min: number | null = null;
        let max: number | null = null;
        let minBigint: bigint | null = null;
        let maxBigint: bigint | null = null;

        const addValue = (value: number | bigint): void => {
            if (typeof value === 'number') {
                sum += value;
                if (min === null || value < min) {
                    min = value;
                }
                if (max === null || value > max) {
                    max = value;
                }

                if (!Number.isInteger(value) || !Number.isSafeInteger(value)) {
                    seenNonInteger = true;
                } else {
                    const bigintValue = BigInt(value);
                    sumBigint += bigintValue;
                    if (minBigint === null || bigintValue < minBigint) {
                        minBigint = bigintValue;
                    }
                    if (maxBigint === null || bigintValue > maxBigint) {
                        maxBigint = bigintValue;
                    }
                }
            } else {
                hasBigInt = true;
                sumBigint += value;
                if (minBigint === null || value < minBigint) {
                    minBigint = value;
                }
                if (maxBigint === null || value > maxBigint) {
                    maxBigint = value;
                }

                const numberValue = Number(value);
                sum += numberValue;
                if (min === null || numberValue < min) {
                    min = numberValue;
                }
                if (max === null || numberValue > max) {
                    max = numberValue;
                }
            }

            numericCount++;
        };

        const cellsSoFar: Record<string, true> = {};
        if (cellRanges?.length && rangeSvc) {
            for (let i = 0; i < cellRanges.length; i++) {
                const cellRange = cellRanges[i];

                let currentRow: RowPosition | null = rangeSvc.getRangeStartRow(cellRange);
                const lastRow = rangeSvc.getRangeEndRow(cellRange);

                while (true) {
                    const finishedAllRows = _missing(currentRow) || !currentRow || _isRowBefore(lastRow, currentRow);
                    if (finishedAllRows || !currentRow || !cellRange.columns) {
                        break;
                    }

                    cellRange.columns.forEach((col: AgColumn) => {
                        if (currentRow === null) {
                            return;
                        }

                        // we only want to include each cell once, in case a cell is in multiple ranges
                        const cellId = _createCellId({
                            rowPinned: currentRow.rowPinned,
                            column: col,
                            rowIndex: currentRow.rowIndex,
                        });
                        if (cellsSoFar[cellId]) {
                            return;
                        }
                        cellsSoFar[cellId] = true;

                        const rowNode = _getRowNode(beans, currentRow);
                        if (_missing(rowNode)) {
                            return;
                        }

                        // Direct `valueSvc.getValue` + inline formula resolution — `rowNode.getDataValue`
                        // would pay an extra `colModel.getColOrColDefCol` lookup per cell on this hot
                        // path (called for every cell across the selected ranges on each selection change).
                        let value: any = valueSvc.getValueFromData(col, rowNode);
                        if (col.allowFormula && formulaSvc?.isFormula(value)) {
                            value = formulaSvc.resolveValue(col, rowNode);
                        }

                        // if empty cell, skip it, doesn't impact count or anything
                        if (_missing(value) || value === '') {
                            return;
                        }

                        count++;

                        // see if value is wrapped, can happen when doing count() or avg() functions
                        if (typeof value === 'object' && 'value' in value) {
                            value = value.value;

                            // ensure that the new value wouldn't have been skipped by the previous check
                            if (value === '') {
                                return;
                            }
                        }

                        if (typeof value === 'string') {
                            const trimmedValue = value.trim();
                            if (trimmedValue === '') {
                                return;
                            }

                            const asNumber = Number(trimmedValue);
                            if (!Number.isFinite(asNumber)) {
                                return;
                            }
                            if (
                                sum + asNumber >= Number.MAX_SAFE_INTEGER ||
                                sum + asNumber <= Number.MIN_SAFE_INTEGER ||
                                asNumber >= Number.MAX_SAFE_INTEGER ||
                                asNumber <= Number.MIN_SAFE_INTEGER
                            ) {
                                value = _parseBigIntOrNull(trimmedValue);
                                if (value === null) {
                                    value = asNumber;
                                }
                            } else {
                                value = asNumber;
                            }
                        }

                        if ((typeof value === 'number' && !isNaN(value)) || typeof value === 'bigint') {
                            addValue(value);
                        }
                    });

                    currentRow = _getRowBelow(beans, currentRow);
                }
            }
        }

        const moreThanOneValue = count > 1;
        const moreThanOneNum = numericCount > 1;
        const useBigintAggregation = hasBigInt && !seenNonInteger;

        let avg: bigint | number;
        if (useBigintAggregation) {
            avg = sumBigint / BigInt(numericCount);
        } else {
            avg = sum / numericCount;
        }

        const sumValue = moreThanOneNum ? (useBigintAggregation ? sumBigint : sum) : null;
        const minValue = moreThanOneNum ? (useBigintAggregation ? minBigint : min) : null;
        const maxValue = moreThanOneNum ? (useBigintAggregation ? maxBigint : max) : null;
        const avgValue = moreThanOneNum ? avg : null;
        const showAvg = moreThanOneNum;

        // we show count even if no numbers
        this.setAggregationComponentValue('count', count, moreThanOneValue);
        this.setAggregationComponentValue('sum', sumValue, moreThanOneNum);
        this.setAggregationComponentValue('min', minValue, moreThanOneNum);
        this.setAggregationComponentValue('max', maxValue, moreThanOneNum);
        this.setAggregationComponentValue('avg', avgValue, showAvg);
    }
}
