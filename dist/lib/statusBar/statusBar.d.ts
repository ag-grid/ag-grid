// ag-grid-enterprise v4.0.1
import { Component } from 'ag-grid';
export declare class StatusBar extends Component {
    private static TEMPLATE;
    private eventService;
    private rangeController;
    private valueService;
    private cellNavigationService;
    private floatingRowModel;
    private rowModel;
    private context;
    private gridOptionsWrapper;
    private statusItemSum;
    private statusItemCount;
    private statusItemMin;
    private statusItemMax;
    private statusItemAvg;
    private aggregationsComponent;
    constructor();
    private init();
    private createStatusItems();
    private forEachStatusItem(callback);
    private onRangeSelectionChanged();
    private getRowNode(gridRow);
}
