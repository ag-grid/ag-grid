import type { BeanCollection } from '../context/context';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IRowNode } from '../interfaces/iRowNode';
import type { RedrawRowsParams } from '../rendering/rowRenderer';

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

/** @deprecated v31.1 */
export function getFirstDisplayedRow(beans: BeanCollection): number {
    return getFirstDisplayedRowIndex(beans);
}

export function getFirstDisplayedRowIndex(beans: BeanCollection): number {
    return beans.rowRenderer.getFirstVirtualRenderedRow();
}

/** @deprecated v31.1 */
export function getLastDisplayedRow(beans: BeanCollection): number {
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

/** @deprecated v31.1 */
export function getModel(beans: BeanCollection): IRowModel {
    return beans.rowModel;
}
