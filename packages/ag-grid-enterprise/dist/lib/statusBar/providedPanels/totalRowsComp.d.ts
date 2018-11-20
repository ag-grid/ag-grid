// ag-grid-enterprise v19.1.3
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
//# sourceMappingURL=totalRowsComp.d.ts.map