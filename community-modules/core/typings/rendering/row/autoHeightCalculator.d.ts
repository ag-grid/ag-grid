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
