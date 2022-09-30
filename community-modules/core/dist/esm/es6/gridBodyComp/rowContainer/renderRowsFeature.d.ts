// Type definitions for @ag-grid-community/core v28.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../../entities/rowNode";
export interface RenderParams {
    rows: RowNode;
}
export interface RenderRowsFeature {
    render(rows: RowNode[]): void;
}
export declare class RenderRowsNormalFeature implements RenderRowsFeature {
    render(rows: RowNode[]): void;
}
export declare class RenderRowsPinnedFeature implements RenderRowsFeature {
    render(rows: RowNode[]): void;
}
