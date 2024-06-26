import type { AgEvent } from '../events';
import type { RowNodeBlock } from './rowNodeBlock';
export interface LoadCompleteEvent extends AgEvent<'loadComplete'> {
    success: boolean;
    block: RowNodeBlock;
}
export interface LoadSuccessParams {
    /**
     * Data retrieved from the server as requested by the grid.
     */
    rowData: any[];
    /**
     * The last row, if known, to help Infinite Scroll.
     */
    rowCount?: number;
    /**
     * Any extra information for the grid to associate with this load.
     */
    groupLevelInfo?: any;
    /**
     * The pivot fields in the response - if provided the grid will attempt to generate secondary columns.
     */
    pivotResultFields?: string[];
}
