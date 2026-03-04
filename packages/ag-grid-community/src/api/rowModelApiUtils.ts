import type { BeanCollection } from '../context/context';
import type { InfiniteRowModel } from '../infiniteRowModel/infiniteRowModel';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IServerSideRowModel } from '../interfaces/iServerSideRowModel';
import type { iViewportRowModel } from '../interfaces/iViewportRowModel';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getClientSideRowModel(beans: BeanCollection): IClientSideRowModel | undefined {
    const rowModel = beans.rowModel;
    return rowModel.getType() === 'clientSide' ? (rowModel as IClientSideRowModel) : undefined;
}

export function _getInfiniteRowModel(beans: BeanCollection): InfiniteRowModel | undefined {
    const rowModel = beans.rowModel;
    return rowModel.getType() === 'infinite' ? (rowModel as InfiniteRowModel) : undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getServerSideRowModel(beans: BeanCollection): IServerSideRowModel | undefined {
    const rowModel = beans.rowModel;
    return rowModel.getType() === 'serverSide' ? (rowModel as IServerSideRowModel) : undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getViewportRowModel(beans: BeanCollection): iViewportRowModel | undefined {
    const rowModel = beans.rowModel;
    return rowModel.getType() === 'viewport' ? (rowModel as iViewportRowModel) : undefined;
}
