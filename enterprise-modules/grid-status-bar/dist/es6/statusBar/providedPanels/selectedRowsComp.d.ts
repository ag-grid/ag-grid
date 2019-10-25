import { IStatusPanelComp } from '@ag-community/grid-core';
import { NameValueComp } from "./nameValueComp";
export declare class SelectedRowsComp extends NameValueComp implements IStatusPanelComp {
    private eventService;
    private gridApi;
    protected postConstruct(): void;
    private isValidRowModel;
    private onRowSelectionChanged;
    init(): void;
}
