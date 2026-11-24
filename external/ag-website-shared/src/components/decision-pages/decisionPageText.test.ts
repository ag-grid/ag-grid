import { featureCellTone } from './decisionPageText';

describe('featureCellTone', () => {
    test.each([
        [{ status: 'yes', plan: 'Free' }, 'free'],
        [{ status: 'yes' }, 'free'],
        [{ status: 'yes', plan: 'Enterprise' }, 'paid'],
        [{ status: 'limited', plan: 'Limited' }, 'limited'],
        [{ status: 'no' }, 'none'],
    ] as const)('%o is %s', (cell, tone) => {
        expect(featureCellTone(cell)).toBe(tone);
    });
});
