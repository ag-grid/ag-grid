import type { BeanCollection } from '../context/context';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import type { SearchMatch } from './searchService';

export function searchNext(beans: BeanCollection): void {
    beans.search?.next();
}

export function searchPrevious(beans: BeanCollection): void {
    beans.search?.previous();
}

export function searchGetTotalMatches(beans: BeanCollection): number {
    return beans.search?.totalMatches ?? 0;
}

export function searchGoTo(beans: BeanCollection, match: number): void {
    beans.search?.goTo(match);
}

export function searchGetActiveMatch(beans: BeanCollection): SearchMatch | undefined {
    return beans.search?.activeMatch;
}

export function searchGetNumMatches(beans: BeanCollection, params: { node: IRowNode; column: Column }): number {
    const { node, column } = params;
    return beans.search?.getNumMatches(node, column) ?? 0;
}

export function searchGetParts(
    beans: BeanCollection,
    params: { value: string; node: IRowNode; column: Column }
): { value: string; match?: boolean; activeMatch?: boolean }[] {
    return beans.search?.getParts(params) ?? [];
}
