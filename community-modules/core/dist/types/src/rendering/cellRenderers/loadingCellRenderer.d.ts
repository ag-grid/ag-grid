import type { IComponent } from '../../interfaces/iComponent';
import { Component } from '../../widgets/component';
import type { ICellRendererParams } from './iCellRenderer';
export interface ILoadingCellRendererParams<TData = any, TContext = any> extends ICellRendererParams<TData, TContext> {
}
export interface ILoadingCellRenderer {
}
export interface ILoadingCellRendererComp extends ILoadingCellRenderer, IComponent<ILoadingCellRendererParams> {
}
export declare class LoadingCellRenderer extends Component implements ILoadingCellRendererComp {
    private readonly eLoadingIcon;
    private readonly eLoadingText;
    constructor();
    init(params: ILoadingCellRendererParams): void;
    private setupFailed;
    private setupLoading;
    refresh(params: ILoadingCellRendererParams): boolean;
    destroy(): void;
}
