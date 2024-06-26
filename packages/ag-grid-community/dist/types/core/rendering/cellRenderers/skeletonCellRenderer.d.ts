import { Component } from '../../widgets/component';
import type { ILoadingCellRendererComp, ILoadingCellRendererParams } from './loadingCellRenderer';
export declare class SkeletonCellRenderer extends Component implements ILoadingCellRendererComp {
    constructor();
    init(params: ILoadingCellRendererParams): void;
    private setupFailed;
    private setupLoading;
    refresh(params: ILoadingCellRendererParams): boolean;
    destroy(): void;
}
