import { IStatusPanelComp } from '@ag-grid-community/grid-core';
import { NameValueComp } from "./nameValueComp";
export declare class TotalRowsComp extends NameValueComp implements IStatusPanelComp {
    private eventService;
    private gridApi;
    protected postConstruct(): void;
    private onDataChanged;
    private getRowCountValue;
    init(): void;
}
