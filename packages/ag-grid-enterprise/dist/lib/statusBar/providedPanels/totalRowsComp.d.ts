// ag-grid-enterprise v20.1.0
import { IStatusPanelComp } from 'ag-grid-community';
import { NameValueComp } from "./nameValueComp";
export declare class TotalRowsComp extends NameValueComp implements IStatusPanelComp {
    private eventService;
    private gridApi;
    constructor();
    protected postConstruct(): void;
    private onDataChanged;
    private getRowCountValue;
    init(): void;
}
