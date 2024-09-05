import type {
    AgColumn,
    AggregationStatusPanelAggFunc,
    AggregationStatusPanelParams,
    BeanCollection,
    CellNavigationService,
    CellPositionUtils,
    IRangeService,
    IStatusPanelComp,
    RowPosition,
    RowPositionUtils,
    ValueService,
} from '@ag-grid-community/core';
import {
    Component,
    RefPlaceholder,
    _exists,
    _formatNumberTwoDecimalPlacesAndCommas,
    _isClientSideRowModel,
    _isServerSideRowModel,
    _missing,
    _missingOrEmpty,
    _warnOnce,
} from '@ag-grid-community/core';

import type { AgNameValue } from './agNameValue';
import { AgNameValueSelector } from './agNameValue';

export class AggregationComp extends Component implements IStatusPanelComp {
    private valueService: ValueService;
    private cellNavigationService: CellNavigationService;
    private cellPositionUtils: CellPositionUtils;
    private rowPositionUtils: RowPositionUtils;
    private rangeService?: IRangeService;

    public wireBeans(beans: BeanCollection) {
        this.valueService = beans.valueService;
        this.cellNavigationService = beans.cellNavigationService;
        this.cellPositionUtils = beans.cellPositionUtils;
        this.rowPositionUtils = beans.rowPositionUtils;
        this.rangeService = beans.rangeService;
    }

    private readonly sumAggregationComp: AgNameValue = RefPlaceholder;
    private readonly countAggregationComp: AgNameValue = RefPlaceholder;
    private readonly minAggregationComp: AgNameValue = RefPlaceholder;
    private readonly maxAggregationComp: AgNameValue = RefPlaceholder;
    private readonly avgAggregationComp: AgNameValue = RefPlaceholder;

    private params!: AggregationStatusPanelParams;

    constructor() {
        super(
            /* html */ `<div class="ag-status-panel ag-status-panel-aggregations">
            <ag-name-value data-ref="avgAggregationComp"></ag-name-value>
            <ag-name-value data-ref="countAggregationComp"></ag-name-value>
            <ag-name-value data-ref="minAggregationComp"></ag-name-value>
            <ag-name-value data-ref="maxAggregationComp"></ag-name-value>
            <ag-name-value data-ref="sumAggregationComp"></ag-name-value>
        </div>`,
            [AgNameValueSelector]
        );
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public override destroy(): void {
        super.destroy();
    }

    public postConstruct(): void {
        if (!_isClientSideRowModel(this.gos) && !_isServerSideRowModel(this.gos)) {
            _warnOnce(`agAggregationComponent should only be used with the client and server side row model.`);
            return;
        }

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
        this.onCellSelectionChanged();
        return true;
    }

    private setAggregationComponentValue(
        aggFuncName: AggregationStatusPanelAggFunc,
        value: number | null,
        visible: boolean
    ) {
        const statusBarValueComponent = this.getAllowedAggregationValueComponent(aggFuncName);
        if (_exists(statusBarValueComponent) && statusBarValueComponent) {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            const thousandSeparator = localeTextFunc('thousandSeparator', ',');
            const decimalSeparator = localeTextFunc('decimalSeparator', '.');

            statusBarValueComponent.setValue(
                _formatNumberTwoDecimalPlacesAndCommas(value!, thousandSeparator, decimalSeparator)
            );
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
        const cellRanges = this.rangeService?.getCellRanges();

        let sum = 0;
        let count = 0;
        let numberCount = 0;
        let min: number | null = null;
        let max: number | null = null;

        const cellsSoFar: any = {};

        if (cellRanges && !_missingOrEmpty(cellRanges) && this.rangeService) {
            for (let i = 0; i < cellRanges.length; i++) {
                const cellRange = cellRanges[i];

                let currentRow: RowPosition | null = this.rangeService.getRangeStartRow(cellRange);
                const lastRow = this.rangeService.getRangeEndRow(cellRange);

                while (true) {
                    const finishedAllRows =
                        _missing(currentRow) || !currentRow || this.rowPositionUtils.before(lastRow, currentRow);
                    if (finishedAllRows || !currentRow || !cellRange.columns) {
                        break;
                    }

                    cellRange.columns.forEach((col: AgColumn) => {
                        if (currentRow === null) {
                            return;
                        }

                        // we only want to include each cell once, in case a cell is in multiple ranges
                        const cellId = this.cellPositionUtils.createId({
                            rowPinned: currentRow.rowPinned,
                            column: col,
                            rowIndex: currentRow.rowIndex,
                        });
                        if (cellsSoFar[cellId]) {
                            return;
                        }
                        cellsSoFar[cellId] = true;

                        const rowNode = this.rowPositionUtils.getRowNode(currentRow);
                        if (_missing(rowNode)) {
                            return;
                        }

                        let value = this.valueService.getValue(col, rowNode);

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

                        if (typeof value === 'number' && !isNaN(value)) {
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

                    currentRow = this.cellNavigationService.getRowBelow(currentRow);
                }
            }
        }

        const gotResult = count > 1;
        const gotNumberResult = numberCount > 1;

        // we show count even if no numbers
        this.setAggregationComponentValue('count', count, gotResult);

        // show if numbers found
        this.setAggregationComponentValue('sum', sum, gotNumberResult);
        this.setAggregationComponentValue('min', min, gotNumberResult);
        this.setAggregationComponentValue('max', max, gotNumberResult);
        this.setAggregationComponentValue('avg', sum / numberCount, gotNumberResult);
    }
}
