import type { ICellComp } from '../rendering/cell/cellCtrl';

export interface ICellRangeFeature {
    setComp(cellComp: ICellComp, eGui: HTMLElement): void;
    refreshHandle(): void;
    updateRangeBordersIfRangeCount(): void;
    onCellSelectionChanged(): void;
    destroy(): void;
}
