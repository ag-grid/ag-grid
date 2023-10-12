import { ColumnApi } from "../columns/columnApi";
import { GridApi } from "../gridApi";

/**
 * Alias for the grid API or an object containing the grid API for linking Aligned Grids.
 */
export type AlignedGrid = { api?: GridApi | null, columnApi?: ColumnApi | null } | GridApi;