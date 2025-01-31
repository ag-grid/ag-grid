import type { BeanCollection } from '../context/context';
import type { CellPosition } from '../interfaces/iCellPosition';

export function searchNext(beans: BeanCollection): void {
    beans.search?.next();
}

export function searchPrevious(beans: BeanCollection): void {
    beans.search?.previous();
}

export function searchGetTotalMatches(beans: BeanCollection): number {
    return beans.search?.getTotalMatches() ?? 0;
}

export function searchGoTo(beans: BeanCollection, match: number): void {
    beans.search?.goTo(match);
}

export function searchGetActiveMatch(beans: BeanCollection): CellPosition | undefined {
    return beans.search?.getActiveMatch();
}

export function searchGetActiveMatchNum(beans: BeanCollection): number | undefined {
    return beans.search?.getActiveMatchNum();
}
