import type { BeanCollection } from '../context/context';
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
