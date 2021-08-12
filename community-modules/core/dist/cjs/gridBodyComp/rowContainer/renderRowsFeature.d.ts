// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
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
