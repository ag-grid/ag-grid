import type { BeanCollection } from '../../context/context';
import type { CellCtrl, ICellComp } from './cellCtrl';
export declare class CellRangeFeature {
    private beans;
    private rangeService;
    private selectionHandleFactory;
    private cellComp;
    private cellCtrl;
    private eGui;
    private rangeCount;
    private hasChartRange;
    private selectionHandle;
    constructor(beans: BeanCollection, ctrl: CellCtrl);
    setComp(cellComp: ICellComp, eGui: HTMLElement): void;
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
