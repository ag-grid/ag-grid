// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
export declare class ChangeDetectionService extends BeanStub {
    private gridOptionsWrapper;
    private rowModel;
    private rowRenderer;
    private eventService;
    private clientSideRowModel;
    private init();
    private onCellValueChanged(event);
    private doChangeDetection(rowNode, column);
}
