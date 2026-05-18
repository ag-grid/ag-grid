import type { ICellComp } from '../rendering/cell/cellCtrl';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ICellRangeFeature {
    setComp(cellComp: ICellComp): void;
    unsetComp(): void;
    scheduleRefreshRangeStyleAndHandle(): void;
    updateRangeBordersIfRangeCount(): void;
    onCellSelectionChanged(): void;
    destroy(): void;
}
