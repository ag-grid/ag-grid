import type { IRowNode } from '../main';

export interface RedrawRowsParams<TData = any> {
    /** Row nodes to redraw */
    rowNodes?: IRowNode<TData>[];
}
