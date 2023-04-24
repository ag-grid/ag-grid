import { Component, IStatusPanelComp, CellPositionUtils, RowPositionUtils } from '@ag-grid-community/core';
export declare class AggregationComp extends Component implements IStatusPanelComp {
    private static TEMPLATE;
    private rangeService;
    private valueService;
    private cellNavigationService;
    private rowRenderer;
    private gridApi;
    cellPositionUtils: CellPositionUtils;
    rowPositionUtils: RowPositionUtils;
    private sumAggregationComp;
    private countAggregationComp;
    private minAggregationComp;
    private maxAggregationComp;
    private avgAggregationComp;
    constructor();
    destroy(): void;
    private postConstruct;
    private isValidRowModel;
    init(): void;
    private setAggregationComponentValue;
    private getAggregationValueComponent;
    private onRangeSelectionChanged;
}
