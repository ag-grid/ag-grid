// ag-grid-enterprise v21.2.2
import { IStatusPanelComp } from 'ag-grid-community';
import { NameValueComp } from "./nameValueComp";
export declare class SelectedRowsComp extends NameValueComp implements IStatusPanelComp {
    private eventService;
    private gridApi;
    protected postConstruct(): void;
    private isValidRowModel;
    private onRowSelectionChanged;
    init(): void;
}
