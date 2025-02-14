import type { BeanCollection, FindCellParams, FindCellValueParams, FindMatch, FindPart } from 'ag-grid-community';

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

export function findGetNumMatches(beans: BeanCollection, params: FindCellParams): number {
    const { node, column } = params;
    return beans.find?.getNumMatches(node, column) ?? 0;
}

export function findGetParts(beans: BeanCollection, params: FindCellValueParams): FindPart[] {
    return beans.find?.getParts(params) ?? [];
}
