/**
 * Parameters passed to the Advanced Filter Builder
 */
export interface IAdvancedFilterBuilderParams {
    /**
     * Minimum width in pixels of the Advanced Filter Builder popup.
     * @default 500
     */
    minWidth?: number;
    /**
     * Whether to show the move up and move down buttons in the Advanced Filter Builder.
     * @default false
     */
    showMoveButtons?: boolean;
    /**
     * Width in pixels of the Advanced Filter Builder add button select popup.
     * @default 120
     */
    addSelectWidth?: number;
    /**
     * Min width in pixels of the Advanced Filter Builder pill select popup.
     * @default 140
     */
    pillSelectMinWidth?: number;
    /**
     * Max width in pixels of the Advanced Filter Builder pill select popup.
     * @default 200
     */
    pillSelectMaxWidth?: number;
}
