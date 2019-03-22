// ag-grid-enterprise v20.2.0
import { Component, IStatusPanelComp } from 'ag-grid-community';
export declare class AggregationComp extends Component implements IStatusPanelComp {
    private static TEMPLATE;
    private eventService;
    private rangeController;
    private valueService;
    private cellNavigationService;
    private pinnedRowModel;
    private rowModel;
    private gridOptionsWrapper;
    private gridOptions;
    private gridApi;
    private sumAggregationComp;
    private countAggregationComp;
    private minAggregationComp;
    private maxAggregationComp;
    private avgAggregationComp;
    constructor();
    private postConstruct;
    private isValidRowModel;
    init(): void;
    private setAggregationComponentValue;
    private getAggregationValueComponent;
    private onRangeSelectionChanged;
    private getRowNode;
}
