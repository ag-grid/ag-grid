import type {
    AgColumn,
    AggregationStatusPanelAggFunc,
    AggregationStatusPanelParams,
    ElementParams,
    IStatusPanelComp,
    LocaleTextFunc,
    RowPosition,
} from 'ag-grid-community';
import {
    Component,
    RefPlaceholder,
    _createCellId,
    _exists,
    _formatNumberCommas,
    _getRowBelow,
    _getRowNode,
    _isRowBefore,
    _missing,
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
            (({ value }) => _formatNumberTwoDecimalPlacesAndCommas(value, this.getLocaleTextFunc.bind(this)));

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

    private onCellSelectionChanged(): void {
        const beans = this.beans;
        const { rangeSvc, valueSvc } = beans;
        const cellRanges = rangeSvc?.getCellRanges();

        let sum = 0;
        let count = 0;
        let numberCount = 0;
        let min: number | null = null;
        let max: number | null = null;
        let hasNonIntegerNumber = false;

        let useBigIntAggregation = false;
        let bigIntSum: bigint | null = null;
        let bigIntMin: bigint | null = null;
        let bigIntMax: bigint | null = null;
        let bigIntCount = 0;

        const cellsSoFar: any = {};

        const addBigIntValue = (value: bigint | null): void => {
            if (value == null) {
                return;
            }

            if (bigIntSum == null) {
                bigIntSum = value;
                bigIntMin = value;
                bigIntMax = value;
            } else {
                bigIntSum += value;
                if (bigIntMin == null || value < bigIntMin) {
                    bigIntMin = value;
                }
                if (bigIntMax == null || value > bigIntMax) {
                    bigIntMax = value;
                }
            }

            bigIntCount++;
        };

        const enableBigIntAggregation = (): void => {
            if (useBigIntAggregation) {
                return;
            }

            if (hasNonIntegerNumber) {
                return;
            }

            if (numberCount > 0) {
                const minValue = min ?? 0;
                const maxValue = max ?? 0;
                if (!Number.isInteger(sum) || !Number.isInteger(minValue) || !Number.isInteger(maxValue)) {
                    hasNonIntegerNumber = true;
                    return;
                }

                bigIntSum = BigInt(sum);
                bigIntMin = BigInt(minValue);
                bigIntMax = BigInt(maxValue);
                bigIntCount = numberCount;
            }
            useBigIntAggregation = true;
        };

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

                        let value = valueSvc.getValue(col, rowNode, 'data');

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
                            value = Number(value);
                        }

                        if (typeof value === 'bigint') {
                            enableBigIntAggregation();
                            if (useBigIntAggregation) {
                                addBigIntValue(value);
                            }
                            return;
                        }

                        if (typeof value === 'number' && !isNaN(value)) {
                            if (useBigIntAggregation) {
                                if (Number.isInteger(value)) {
                                    addBigIntValue(BigInt(value));
                                }
                                return;
                            }

                            if (!Number.isInteger(value)) {
                                hasNonIntegerNumber = true;
                            }

                            sum += value;

                            if (max === null || value > max) {
                                max = value;
                            }

                            if (min === null || value < min) {
                                min = value;
                            }

                            numberCount++;
                        }
                    });

                    currentRow = _getRowBelow(beans, currentRow);
                }
            }
        }

        const gotResult = count > 1;
        const gotNumberResult = !useBigIntAggregation && numberCount > 1;
        const gotBigIntResult = useBigIntAggregation && bigIntCount > 1;

        // we show count even if no numbers
        this.setAggregationComponentValue('count', count, gotResult);

        // show if numbers found
        if (useBigIntAggregation) {
            const avg = bigIntSum != null && bigIntCount > 0 ? bigIntSum / BigInt(bigIntCount) : null;
            this.setAggregationComponentValue('sum', bigIntSum, gotBigIntResult);
            this.setAggregationComponentValue('min', bigIntMin, gotBigIntResult);
            this.setAggregationComponentValue('max', bigIntMax, gotBigIntResult);
            this.setAggregationComponentValue('avg', avg, gotBigIntResult);
        } else {
            this.setAggregationComponentValue('sum', sum, gotNumberResult);
            this.setAggregationComponentValue('min', min, gotNumberResult);
            this.setAggregationComponentValue('max', max, gotNumberResult);
            this.setAggregationComponentValue('avg', sum / numberCount, gotNumberResult);
        }
    }
}
