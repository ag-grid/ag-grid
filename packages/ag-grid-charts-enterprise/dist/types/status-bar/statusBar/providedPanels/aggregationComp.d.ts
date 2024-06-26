import type { AggregationStatusPanelParams, BeanCollection, IStatusPanelComp } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class AggregationComp extends Component implements IStatusPanelComp {
    private valueService;
    private cellNavigationService;
    private rowModel;
    private cellPositionUtils;
    private rowPositionUtils;
    private rangeService?;
    wireBeans(beans: BeanCollection): void;
    private readonly sumAggregationComp;
    private readonly countAggregationComp;
    private readonly minAggregationComp;
    private readonly maxAggregationComp;
    private readonly avgAggregationComp;
    private params;
    constructor();
    destroy(): void;
    postConstruct(): void;
    private isValidRowModel;
    init(params: AggregationStatusPanelParams): void;
    refresh(params: AggregationStatusPanelParams): boolean;
    private setAggregationComponentValue;
    private getAllowedAggregationValueComponent;
    private getAggregationValueComponent;
    private onRangeSelectionChanged;
}
