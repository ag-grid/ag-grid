import { IStatusPanelComp } from 'ag-grid-community';
import { NameValueComp } from "./nameValueComp";
export declare class TotalRowsComp extends NameValueComp implements IStatusPanelComp {
    private gridApi;
    protected postConstruct(): void;
    private onDataChanged;
    private getRowCountValue;
    init(): void;
    refresh(): boolean;
    destroy(): void;
}
