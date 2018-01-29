// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class ColumnHoverService extends BeanStub {
    private eventService;
    private columnApi;
    private gridApi;
    private currentlySelectedColumn;
    private init();
    private onCellMouseOver(cellEvent);
    private onCellMouseOut();
    isHovered(column: Column): boolean;
}
