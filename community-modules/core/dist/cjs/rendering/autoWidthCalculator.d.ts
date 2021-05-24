// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { HeaderRootComp } from "../headerRendering/headerRootComp";
import { BeanStub } from "../context/beanStub";
export declare class AutoWidthCalculator extends BeanStub {
    private rowRenderer;
    private controllersService;
    private centerRowContainerCon;
    private headerRootComp;
    private postConstruct;
    registerHeaderRootComp(headerRootComp: HeaderRootComp): void;
    getPreferredWidthForColumn(column: Column, skipHeader?: boolean): number;
    private getHeaderCellForColumn;
    private putRowCellsIntoDummyContainer;
    private cloneItemIntoDummy;
}
