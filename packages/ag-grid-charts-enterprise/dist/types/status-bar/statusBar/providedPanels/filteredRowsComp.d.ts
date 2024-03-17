import { IStatusPanelComp } from 'ag-grid-community';
import { NameValueComp } from "./nameValueComp";
export declare class FilteredRowsComp extends NameValueComp implements IStatusPanelComp {
    private gridApi;
    protected postConstruct(): void;
    private onDataChanged;
    private getTotalRowCountValue;
    private getFilteredRowCountValue;
    init(): void;
    refresh(): boolean;
    destroy(): void;
}
