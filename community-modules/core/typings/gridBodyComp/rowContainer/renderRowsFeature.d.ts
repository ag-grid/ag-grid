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
