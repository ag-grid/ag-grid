import { IStatusPanelComp } from '@ag-grid-community/core';
import { NameValueComp } from "./nameValueComp";
export declare class SelectedRowsComp extends NameValueComp implements IStatusPanelComp {
    private gridApi;
    private selectionService;
    protected postConstruct(): void;
    private isValidRowModel;
    private onRowSelectionChanged;
    init(): void;
    destroy(): void;
}
