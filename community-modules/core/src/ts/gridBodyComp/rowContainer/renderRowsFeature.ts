import { RowNode } from "../../entities/rowNode";

export interface RenderParams {
    rows: RowNode;
}

export interface RenderRowsFeature {
    render(rows: RowNode[]): void;
}

export class RenderRowsNormalFeature implements RenderRowsFeature {
    public render(rows: RowNode[]): void {

    }
}

export class RenderRowsPinnedFeature implements RenderRowsFeature {
    public render(rows: RowNode[]): void {

    }
}

// controller is shared
// controller has 3 parts
// ui registers to the controller
// controller created by rowRenderer
// need to split rowComp into rowComp and rowController