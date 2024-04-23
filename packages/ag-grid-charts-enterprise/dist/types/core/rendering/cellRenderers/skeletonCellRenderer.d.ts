import { Component } from "../../widgets/component";
import { ILoadingCellRendererComp, ILoadingCellRendererParams } from "./loadingCellRenderer";
export declare class SkeletonCellRenderer extends Component implements ILoadingCellRendererComp {
    private static TEMPLATE;
    constructor();
    init(params: ILoadingCellRendererParams): void;
    private setupFailed;
    private setupLoading;
    refresh(params: ILoadingCellRendererParams): boolean;
    destroy(): void;
}
