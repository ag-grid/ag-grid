import { groupRoadmapByQuarter } from './groupRoadmapByQuarter';

const item = (id: string, q: number, status: string) => ({ id, q, status });

describe('groupRoadmapByQuarter', () => {
    it('groups items by quarter in the order quarters first appear', () => {
        const groups = groupRoadmapByQuarter([
            item('a', 2, 'planned'),
            item('b', 1, 'planned'),
            item('c', 2, 'planned'),
        ]);

        expect(groups.map(([quarter, items]) => [quarter, items.map(({ id }) => id)])).toEqual([
            [2, ['a', 'c']],
            [1, ['b']],
        ]);
    });

    it('puts shipped items first, then in progress, then planned', () => {
        const [[, items]] = groupRoadmapByQuarter([
            item('planned', 4, 'planned'),
            item('shipped', 4, 'shipped'),
            item('in-progress', 4, 'in-progress'),
        ]);

        expect(items.map(({ id }) => id)).toEqual(['shipped', 'in-progress', 'planned']);
    });

    it('keeps JSON order within a status and sorts unknown statuses last', () => {
        const [[, items]] = groupRoadmapByQuarter([
            item('unknown', 1, 'blocked'),
            item('planned-1', 1, 'planned'),
            item('shipped-1', 1, 'shipped'),
            item('planned-2', 1, 'planned'),
            item('shipped-2', 1, 'shipped'),
        ]);

        expect(items.map(({ id }) => id)).toEqual(['shipped-1', 'shipped-2', 'planned-1', 'planned-2', 'unknown']);
    });

    it('does not mutate the input', () => {
        const input = [item('planned', 1, 'planned'), item('shipped', 1, 'shipped')];
        groupRoadmapByQuarter(input);

        expect(input.map(({ id }) => id)).toEqual(['planned', 'shipped']);
    });
});
