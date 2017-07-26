// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { BeanStub } from "../context/beanStub";
export declare class ChangeDetectionService extends BeanStub {
    private gridOptionsWrapper;
    private rowModel;
    private rowRenderer;
    private eventService;
    private inMemoryRowModel;
    private init();
    private onCellValueChanged(event);
    private doChangeDetection(rowNode, column);
}
