// Type definitions for @ag-grid-community/core v30.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
/**
 * Parameters passed to the Advanced Filter Builder
 */
export interface IAdvancedFilterBuilderParams {
    /** Minimum width in pixels of the Advanced Filter Builder popup. Default: `500` */
    minWidth?: number;
    /** Whether to show the move up and move down buttons in the Advanced Filter Builder. Default: `false` */
    showMoveButtons?: boolean;
    /** Width in pixels of the Advanced Filter Builder add button select popup. Default: `120` */
    addSelectWidth?: number;
    /** Min width in pixels of the Advanced Filter Builder pill select popup. Default: `140` */
    pillSelectMinWidth?: number;
    /** Max width in pixels of the Advanced Filter Builder pill select popup. Default: `200` */
    pillSelectMaxWidth?: number;
}
