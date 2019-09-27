// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { GridPanel } from "../gridPanel/gridPanel";
export declare class PaginationAutoPageSizeService extends BeanStub {
    private eventService;
    private gridOptionsWrapper;
    private scrollVisibleService;
    private gridPanel;
    registerGridComp(gridPanel: GridPanel): void;
    private notActive;
    private onScrollVisibilityChanged;
    private onBodyHeightChanged;
    private checkPageSize;
}
