// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../../entities/rowNode";
import { BeanStub } from "../../context/beanStub";
import { ControllersService } from "../../controllersService";
export declare class AutoHeightCalculator extends BeanStub {
    private beans;
    private $scope;
    private columnController;
    private rowCssClassCalculator;
    $compile: any;
    controllersService: ControllersService;
    private centerRowContainerCon;
    private postConstruct;
    getPreferredHeightForRow(rowNode: RowNode): number;
    private addInRowCssClasses;
}
