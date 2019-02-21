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
