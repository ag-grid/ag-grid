// ag-grid-enterprise v21.2.2
import { IStatusPanelComp } from 'ag-grid-community';
import { NameValueComp } from "./nameValueComp";
export declare class TotalRowsComp extends NameValueComp implements IStatusPanelComp {
    private eventService;
    private gridApi;
    protected postConstruct(): void;
    private onDataChanged;
    private getRowCountValue;
    init(): void;
}
