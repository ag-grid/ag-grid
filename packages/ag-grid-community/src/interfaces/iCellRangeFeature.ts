import type { ICellComp } from '../rendering/cell/cellCtrl';

export interface ICellRangeFeature {
    setComp(cellComp: ICellComp): void;
    unsetComp(): void;
    refreshRangeStyleAndHandle(): void;
    updateRangeBordersIfRangeCount(): void;
    onCellSelectionChanged(): void;
    destroy(): void;
}
