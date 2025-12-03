import type { FindCellParams, FindCellValueParams, FindMatch, FindPart, _BeanCollection } from 'ag-grid-community';

export function findNext(beans: _BeanCollection): void {
    beans.findSvc?.next();
}

export function findPrevious(beans: _BeanCollection): void {
    beans.findSvc?.previous();
}

export function findGetTotalMatches(beans: _BeanCollection): number {
    return beans.findSvc?.totalMatches ?? 0;
}

export function findGoTo(beans: _BeanCollection, match: number, force?: boolean): void {
    beans.findSvc?.goTo(match, force);
}

export function findClearActive(beans: _BeanCollection): void {
    beans.findSvc?.clearActive();
}

export function findGetActiveMatch(beans: _BeanCollection): FindMatch | undefined {
    return beans.findSvc?.activeMatch;
}

export function findGetNumMatches(beans: _BeanCollection, params: FindCellParams): number {
    const { node, column } = params;
    return beans.findSvc?.getNumMatches(node, column) ?? 0;
}

export function findGetParts(beans: _BeanCollection, params: FindCellValueParams): FindPart[] {
    return beans.findSvc?.getParts(params) ?? [];
}

export function findRefresh(beans: _BeanCollection): void {
    return beans.findSvc?.refresh(true);
}
