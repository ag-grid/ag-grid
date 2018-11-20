// ag-grid-enterprise v19.1.3
import { IStatusPanelComp } from 'ag-grid-community';
import { NameValueComp } from "./nameValueComp";
export declare class FilteredRowsComp extends NameValueComp implements IStatusPanelComp {
    private eventService;
    private gridApi;
    constructor();
    protected postConstruct(): void;
    private onDataChanged;
    private getTotalRowCountValue;
    private getFilteredRowCountValue;
    init(): void;
}
//# sourceMappingURL=filteredRowsComp.d.ts.map