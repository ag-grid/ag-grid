// Type definitions for ag-grid v17.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
export declare class AutoHeightCalculator {
    private gridPanel;
    private beans;
    private $scope;
    private columnController;
    private eDummyContainer;
    getPreferredHeightForRow(rowNode: RowNode): number;
}
