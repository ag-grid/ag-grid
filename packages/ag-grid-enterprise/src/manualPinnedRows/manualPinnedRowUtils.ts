import { _removeFromArray } from 'ag-grid-community';
import type { BeanCollection, RowNode } from 'ag-grid-community';

export interface PinnedRows {
    all: Set<RowNode>;
    visible: Set<RowNode>;
    order: RowNode[];
    queued: Set<string>;
}

export const createPinnedRows = (): PinnedRows => ({
    all: new Set(),
    visible: new Set(),
    order: [],
    queued: new Set(),
});

export const size = (pinned: PinnedRows): number => pinned.visible.size;

export const add = (beans: BeanCollection, pinned: PinnedRows, node: RowNode): void => {
    pinned.all.add(node);
    pinned.visible.add(node);
    pinned.order.push(node);
    sort(beans, pinned);
};

export const _delete = (pinned: PinnedRows, node: RowNode): void => {
    pinned.all.delete(node);
    pinned.visible.delete(node);
    _removeFromArray(pinned.order, node);
};

export const clear = (pinned: PinnedRows): void => {
    pinned.all.clear();
    pinned.visible.clear();
    pinned.queued.clear();
    pinned.order.length = 0;
};

export const sort = (beans: BeanCollection, pinned: PinnedRows): void => {
    const sortOptions = beans.sortSvc?.getSortOptions() ?? [];
    pinned.order = beans.rowNodeSorter?.doFullSort(pinned.order, sortOptions) ?? pinned.order;
};

export const hide = (beans: BeanCollection, pinned: PinnedRows, shouldHide: (node: RowNode) => boolean): void => {
    forEach(pinned, (node) => (shouldHide(node) ? pinned.visible.delete(node) : pinned.visible.add(node)));
    pinned.order = Array.from(pinned.visible);
    sort(beans, pinned);
};

export const queue = (pinned: PinnedRows, id: string): Set<string> => pinned.queued.add(id);

export const unqueue = (pinned: PinnedRows, id: string): boolean => pinned.queued.delete(id);

export const has = (pinned: PinnedRows, node: RowNode): boolean => pinned.visible.has(node);

export const forEach = (pinned: PinnedRows, fn: (node: RowNode, i: number) => void): void => pinned.order.forEach(fn);

export const forEachQueued = (pinned: PinnedRows, fn: (id: string) => void): void => pinned.queued.forEach(fn);

export const getById = (pinned: PinnedRows, id: string): RowNode | undefined => {
    for (const node of pinned.visible) {
        if (node.id == id) return node;
    }
};

export const getByIndex = (pinned: PinnedRows, index: number): RowNode | undefined => pinned.order[index];
