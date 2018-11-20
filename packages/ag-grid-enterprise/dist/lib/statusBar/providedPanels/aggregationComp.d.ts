// ag-grid-enterprise v19.1.3
import { Component, IStatusPanelComp } from 'ag-grid-community';
export declare class AggregationComp extends Component implements IStatusPanelComp {
    private static TEMPLATE;
    private eventService;
    private rangeController;
    private valueService;
    private cellNavigationService;
    private pinnedRowModel;
    private rowModel;
    private context;
    private gridOptionsWrapper;
    private gridOptions;
    private gridApi;
    private sumAggregationComp;
    private countAggregationComp;
    private minAggregationComp;
    private maxAggregationComp;
    private avgAggregationComp;
    constructor();
    private preConstruct;
    private postConstruct;
    private isValidRowModel;
    init(): void;
    private setAggregationComponentValue;
    private getAggregationValueComponent;
    private onRangeSelectionChanged;
    private getRowNode;
}
//# sourceMappingURL=aggregationComp.d.ts.map