import { Component, IStatusPanelComp, CellPositionUtils, RowPositionUtils } from '@ag-grid-community/core';
export declare class AggregationComp extends Component implements IStatusPanelComp {
    private static TEMPLATE;
    private rangeController;
    private valueService;
    private cellNavigationService;
    private rowRenderer;
    private gridOptionsWrapper;
    private gridOptions;
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
