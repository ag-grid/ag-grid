// ag-grid-enterprise v20.2.0
import { IStatusPanelComp } from 'ag-grid-community';
import { NameValueComp } from "./nameValueComp";
export declare class TotalAndFilteredRowsComp extends NameValueComp implements IStatusPanelComp {
    private eventService;
    private gridApi;
    protected postConstruct(): void;
    private onDataChanged;
    private getTotalRowCountValue;
    private getFilteredRowCountValue;
    init(): void;
}
