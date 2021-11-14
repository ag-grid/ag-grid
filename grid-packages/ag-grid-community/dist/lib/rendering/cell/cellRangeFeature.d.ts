import { Beans } from "../beans";
import { CellCtrl, ICellComp } from "./cellCtrl";
export declare class CellRangeFeature {
    private beans;
    private cellComp;
    private cellCtrl;
    private rangeCount;
    private hasChartRange;
    private selectionHandle;
    constructor(beans: Beans, ctrl: CellCtrl);
    setComp(cellComp: ICellComp): void;
    onRangeSelectionChanged(): void;
    private updateRangeBorders;
    private isSingleCell;
    private getHasChartRange;
    updateRangeBordersIfRangeCount(): void;
    private getRangeBorders;
    refreshHandle(): void;
    private shouldHaveSelectionHandle;
    private addSelectionHandle;
    destroy(): void;
}
