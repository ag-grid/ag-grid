import { GridPanel } from "../gridPanel/gridPanel";
import { Column } from "../entities/column";
import { HeaderRootComp } from "../headerRendering/headerRootComp";
export declare class AutoWidthCalculator {
    private rowRenderer;
    private gridOptionsWrapper;
    private gridPanel;
    private headerRootComp;
    registerGridComp(gridPanel: GridPanel): void;
    registerHeaderRootComp(headerRootComp: HeaderRootComp): void;
    getPreferredWidthForColumn(column: Column, skipHeader?: boolean): number;
    private getHeaderCellForColumn;
    private putRowCellsIntoDummyContainer;
    private cloneItemIntoDummy;
}
