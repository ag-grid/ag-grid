/**
 * Parameters passed to the Advanced Filter
 */
export interface IAdvancedFilterParams {
    /** Minimum width in pixels of the Advanced Filter Builder popup. Default: `500` */
    builderMinWidth?: number;
    /** Whether to show the move up and move down buttons in the Advanced Filter Builder. Default: `false` */
    builderShowMoveButtons?: boolean;
    /** Width in pixels of the Advanced Filter Builder add button select popup. Default: `120` */
    builderAddSelectWidth?: number;
    /** Min width in pixels of the Advanced Filter Builder pill select popup. Default: `140` */
    builderPillSelectMinWidth?: number;
    /** Max width in pixels of the Advanced Filter Builder pill select popup. Default: `200` */
    builderPillSelectMaxWidth?: number;
}
