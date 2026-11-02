import type { RoadmapItem } from './types';

/** Order cards take within a quarter: shipped work first, then in progress, then planned. */
const STATUS_ORDER: readonly string[] = ['shipped', 'in-progress', 'planned'] satisfies RoadmapItem['status'][];

function statusRank(status: string): number {
    const rank = STATUS_ORDER.indexOf(status);
    return rank === -1 ? STATUS_ORDER.length : rank;
}

/**
 * Group roadmap items into quarters, in the order quarters first appear, with each quarter's
 * items ordered by status. The sort is stable, so items sharing a status keep their JSON order.
 *
 * Shared by `RoadmapBoard` and the markdown twin so both list items identically.
 */
export function groupRoadmapByQuarter<T extends Pick<RoadmapItem, 'q'> & { status: string }>(
    items: T[]
): [quarter: number, items: T[]][] {
    const byQuarter = new Map<number, T[]>();
    for (const item of items) {
        const quarterItems = byQuarter.get(item.q) ?? [];
        quarterItems.push(item);
        byQuarter.set(item.q, quarterItems);
    }

    return [...byQuarter].map(([quarter, quarterItems]) => [
        quarter,
        [...quarterItems].sort((a, b) => statusRank(a.status) - statusRank(b.status)),
    ]);
}
