import { IStatusPanelComp } from '@ag-grid-community/core';
import { NameValueComp } from "./nameValueComp";
export declare class TotalRowsComp extends NameValueComp implements IStatusPanelComp {
    private rowModel;
    protected postConstruct(): void;
    private onDataChanged;
    private getRowCountValue;
    init(): void;
    refresh(): boolean;
    destroy(): void;
}
