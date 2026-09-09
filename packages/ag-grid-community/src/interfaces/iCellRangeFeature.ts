import type { ICellComp } from '../rendering/cell/cellCtrl';
import type { CellSelectionSnapshot } from './IRangeService';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ICellRangeFeature {
    setComp(cellComp: ICellComp): void;
    unsetComp(): void;
    scheduleRefreshRangeStyleAndHandle(): void;
    updateRangeBordersIfRangeCount(state?: CellSelectionSnapshot): void;
    onCellSelectionChanged(state?: CellSelectionSnapshot): void;
    destroy(): void;
}
