import type { BeanCollection } from '../context/context';
import type { SelectionEventSourceType } from '../events';
import type { IRowNode } from '../interfaces/iRowNode';
export declare function setNodesSelected(beans: BeanCollection, params: {
    nodes: IRowNode[];
    newValue: boolean;
    source?: SelectionEventSourceType;
}): void;
export declare function selectAll(beans: BeanCollection, source?: SelectionEventSourceType): void;
export declare function deselectAll(beans: BeanCollection, source?: SelectionEventSourceType): void;
export declare function selectAllFiltered(beans: BeanCollection, source?: SelectionEventSourceType): void;
export declare function deselectAllFiltered(beans: BeanCollection, source?: SelectionEventSourceType): void;
export declare function selectAllOnCurrentPage(beans: BeanCollection, source?: SelectionEventSourceType): void;
export declare function deselectAllOnCurrentPage(beans: BeanCollection, source?: SelectionEventSourceType): void;
export declare function getSelectedNodes<TData = any>(beans: BeanCollection): IRowNode<TData>[];
export declare function getSelectedRows<TData = any>(beans: BeanCollection): TData[];
