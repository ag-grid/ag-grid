import type { BeanCollection, Column, FindMatch, IRowNode } from 'ag-grid-community';

export function findNext(beans: BeanCollection): void {
    beans.find?.next();
}

export function findPrevious(beans: BeanCollection): void {
    beans.find?.previous();
}

export function findGetTotalMatches(beans: BeanCollection): number {
    return beans.find?.totalMatches ?? 0;
}

export function findGoTo(beans: BeanCollection, match: number): void {
    beans.find?.goTo(match);
}

export function findGetActiveMatch(beans: BeanCollection): FindMatch | undefined {
    return beans.find?.activeMatch;
}

export function findGetNumMatches(beans: BeanCollection, params: { node: IRowNode; column: Column }): number {
    const { node, column } = params;
    return beans.find?.getNumMatches(node, column) ?? 0;
}

export function findGetParts(
    beans: BeanCollection,
    params: { value: string; node: IRowNode; column: Column }
): { value: string; match?: boolean; activeMatch?: boolean }[] {
    return beans.find?.getParts(params) ?? [];
}
