import { Component, IStatusPanelComp, CellPositionUtils, RowPositionUtils, AggregationStatusPanelParams } from 'ag-grid-community';
export declare class AggregationComp extends Component implements IStatusPanelComp {
    private static TEMPLATE;
    private rangeService?;
    private valueService;
    private cellNavigationService;
    private rowModel;
    cellPositionUtils: CellPositionUtils;
    rowPositionUtils: RowPositionUtils;
    private sumAggregationComp;
    private countAggregationComp;
    private minAggregationComp;
    private maxAggregationComp;
    private avgAggregationComp;
    private params;
    constructor();
    destroy(): void;
    private postConstruct;
    private isValidRowModel;
    init(params: AggregationStatusPanelParams): void;
    refresh(params: AggregationStatusPanelParams): boolean;
    private setAggregationComponentValue;
    private getAllowedAggregationValueComponent;
    private getAggregationValueComponent;
    private onRangeSelectionChanged;
}
