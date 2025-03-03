import type { BeanCollection, FindCellParams, FindCellValueParams, FindMatch, FindPart } from 'ag-grid-community';

export function findNext(beans: BeanCollection): void {
    beans.findSvc?.next();
}

export function findPrevious(beans: BeanCollection): void {
    beans.findSvc?.previous();
}

export function findGetTotalMatches(beans: BeanCollection): number {
    return beans.findSvc?.totalMatches ?? 0;
}

export function findGoTo(beans: BeanCollection, match: number, force?: boolean): void {
    beans.findSvc?.goTo(match, force);
}

export function findClearActive(beans: BeanCollection): void {
    beans.findSvc?.clearActive();
}

export function findGetActiveMatch(beans: BeanCollection): FindMatch | undefined {
    return beans.findSvc?.activeMatch;
}

export function findGetNumMatches(beans: BeanCollection, params: FindCellParams): number {
    const { node, column } = params;
    return beans.findSvc?.getNumMatches(node, column) ?? 0;
}

export function findGetParts(beans: BeanCollection, params: FindCellValueParams): FindPart[] {
    return beans.findSvc?.getParts(params) ?? [];
}

export function findRefresh(beans: BeanCollection): void {
    return beans.findSvc?.refresh(true);
}
