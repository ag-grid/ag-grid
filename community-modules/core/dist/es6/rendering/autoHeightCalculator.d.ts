// Type definitions for @ag-grid-community/core v23.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridPanel } from "../gridPanel/gridPanel";
import { RowNode } from "../entities/rowNode";
export declare class AutoHeightCalculator {
    private beans;
    private $scope;
    private columnController;
    private gridPanel;
    private eDummyContainer;
    registerGridComp(gridPanel: GridPanel): void;
    getPreferredHeightForRow(rowNode: RowNode): number;
}
