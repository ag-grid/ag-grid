// Type definitions for @ag-grid-community/core v23.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { GridPanel } from "../gridPanel/gridPanel";
export declare class PaginationAutoPageSizeService extends BeanStub {
    private gridOptionsWrapper;
    private gridPanel;
    registerGridComp(gridPanel: GridPanel): void;
    private notActive;
    private onScrollVisibilityChanged;
    private onBodyHeightChanged;
    private checkPageSize;
}
