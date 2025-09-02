import type { BeanCollection } from '../context/context';
import type { InfiniteRowModel } from '../infiniteRowModel/infiniteRowModel';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IServerSideRowModel } from '../interfaces/iServerSideRowModel';
import type { iViewportRowModel } from '../interfaces/iViewportRowModel';

export function _getClientSideRowModel(beans: BeanCollection): IClientSideRowModel | undefined {
    const rowModel = beans.rowModel;
    return rowModel.getType() === 'clientSide' ? (rowModel as IClientSideRowModel) : undefined;
}

export function _getInfiniteRowModel(beans: BeanCollection): InfiniteRowModel | undefined {
    const rowModel = beans.rowModel;
    return rowModel.getType() === 'infinite' ? (rowModel as InfiniteRowModel) : undefined;
}

export function _getServerSideRowModel(beans: BeanCollection): IServerSideRowModel | undefined {
    const rowModel = beans.rowModel;
    return rowModel.getType() === 'serverSide' ? (rowModel as IServerSideRowModel) : undefined;
}

export function _getViewportRowModel(beans: BeanCollection): iViewportRowModel | undefined {
    const rowModel = beans.rowModel;
    return rowModel.getType() === 'viewport' ? (rowModel as iViewportRowModel) : undefined;
}
