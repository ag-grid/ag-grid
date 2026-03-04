/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRenderStatusService {
    /** Checks that every header cell that is currently visible has been rendered.
     * Can only be false under some circumstances when using React.
     */
    areHeaderCellsRendered(): boolean;

    /** Checks that every body cell that is currently visible has been rendered.
     * Can only be false under some circumstances when using React.
     */
    areCellsRendered(): boolean;
}
