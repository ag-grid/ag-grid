// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class ColumnHoverService extends BeanStub {
    private eventService;
    private currentlySelectedColumn;
    private init();
    private onCellMouseOver(cellEvent);
    private onCellMouseOut();
    isHovered(column: Column): boolean;
}
