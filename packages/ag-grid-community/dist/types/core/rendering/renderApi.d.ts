import type { BeanCollection } from '../context/context';
import type { ICellRenderer } from './cellRenderers/iCellRenderer';
import type { FlashCellsParams, GetCellRendererInstancesParams, RefreshCellsParams } from './rowRenderer';
export declare function setGridAriaProperty(beans: BeanCollection, property: string, value: string | null): void;
export declare function refreshCells<TData = any>(beans: BeanCollection, params?: RefreshCellsParams<TData>): void;
export declare function flashCells<TData = any>(beans: BeanCollection, params?: FlashCellsParams<TData>): void;
export declare function refreshHeader(beans: BeanCollection): void;
export declare function isAnimationFrameQueueEmpty(beans: BeanCollection): boolean;
export declare function flushAllAnimationFrames(beans: BeanCollection): void;
export declare function getSizesForCurrentTheme(beans: BeanCollection): {
    rowHeight: number;
    headerHeight: number;
};
export declare function getCellRendererInstances<TData = any>(beans: BeanCollection, params?: GetCellRendererInstancesParams<TData>): ICellRenderer[];
