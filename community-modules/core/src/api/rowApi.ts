import type { BeanCollection } from '../context/context';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IRowNode } from '../interfaces/iRowNode';
import type { RedrawRowsParams } from '../rendering/rowRenderer';
import { _warnOnce } from '../utils/function';
import { _logDeprecation } from './apiUtils';

export function redrawRows<TData = any>(beans: BeanCollection, params: RedrawRowsParams<TData> = {}): void {
    const rowNodes = params ? params.rowNodes : undefined;
    beans.frameworkOverrides.wrapIncoming(() => beans.rowRenderer.redrawRows(rowNodes));
}

export function setRowNodeExpanded(
    beans: BeanCollection,
    rowNode: IRowNode,
    expanded: boolean,
    expandParents?: boolean,
    forceSync?: boolean
): void {
    beans.expansionService.setRowNodeExpanded(rowNode, expanded, expandParents, forceSync);
}

export function getRowNode<TData = any>(beans: BeanCollection, id: string): IRowNode<TData> | undefined {
    return beans.rowModel.getRowNode(id);
}

export function addRenderedRowListener(
    beans: BeanCollection,
    eventName: string,
    rowIndex: number,
    callback: (...args: any[]) => any
) {
    beans.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback as any);
}

export function getRenderedNodes<TData = any>(beans: BeanCollection): IRowNode<TData>[] {
    return beans.rowRenderer.getRenderedNodes();
}

export function forEachNode<TData = any>(
    beans: BeanCollection,
    callback: (rowNode: IRowNode<TData>, index: number) => void,
    includeFooterNodes?: boolean
) {
    beans.rowModel.forEachNode(callback, includeFooterNodes);
}

export function getFirstDisplayedRow(beans: BeanCollection): number {
    _logDeprecation('v31.1', 'getFirstDisplayedRow', 'getFirstDisplayedRowIndex');
    return getFirstDisplayedRowIndex(beans);
}

export function getFirstDisplayedRowIndex(beans: BeanCollection): number {
    return beans.rowRenderer.getFirstVirtualRenderedRow();
}

export function getLastDisplayedRow(beans: BeanCollection): number {
    _logDeprecation('v31.1', 'getLastDisplayedRow', 'getLastDisplayedRowIndex');
    return getLastDisplayedRowIndex(beans);
}

export function getLastDisplayedRowIndex(beans: BeanCollection): number {
    return beans.rowRenderer.getLastVirtualRenderedRow();
}

export function getDisplayedRowAtIndex<TData = any>(beans: BeanCollection, index: number): IRowNode<TData> | undefined {
    return beans.rowModel.getRow(index);
}

export function getDisplayedRowCount(beans: BeanCollection): number {
    return beans.rowModel.getRowCount();
}

export function getModel(beans: BeanCollection): IRowModel {
    _warnOnce('Since v31.1 getModel() is deprecated. Please use the appropriate grid API methods instead.');
    return beans.rowModel;
}
