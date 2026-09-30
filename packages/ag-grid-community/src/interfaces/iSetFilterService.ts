/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ISetFilterService {
    /** Every column when `colId` is omitted. */
    clearPreservedValues(colId: string | string[] | undefined, onlyUnselected: boolean): void;
}
