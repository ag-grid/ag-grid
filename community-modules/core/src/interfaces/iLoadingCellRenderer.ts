import type { ICellRendererParams } from '../rendering/cellRenderers/iCellRenderer';
import type { IComponent } from './iComponent';

export interface ILoadingCellRendererParams<TData = any, TContext = any> extends ICellRendererParams<TData, TContext> {}
export interface ILoadingCellRenderer {}
export interface ILoadingCellRendererComp extends ILoadingCellRenderer, IComponent<ILoadingCellRendererParams> {}
