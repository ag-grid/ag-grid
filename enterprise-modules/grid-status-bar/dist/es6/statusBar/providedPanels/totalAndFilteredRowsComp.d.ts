import { IStatusPanelComp } from '@ag-grid-community/grid-core';
import { NameValueComp } from "./nameValueComp";
export declare class TotalAndFilteredRowsComp extends NameValueComp implements IStatusPanelComp {
    private gridApi;
    private eventService;
    protected postConstruct(): void;
    private onDataChanged;
    private getFilteredRowCountValue;
    private getTotalRowCount;
    init(): void;
}
