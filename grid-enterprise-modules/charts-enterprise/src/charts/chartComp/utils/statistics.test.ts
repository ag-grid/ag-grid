import { describe, expect, it } from '@jest/globals';

import { quantiles } from './statistics';

describe(quantiles, () => {
    it('should compute correct quantile values', () => {
        const data = [38031, 17697, 54892, 81081, 73947, 20479, 44446, 32411, 82948, 93514];
        expect(quantiles(data, {
            min: 0,
            q1: 0.25,
            median: 0.5,
            q3: 0.75,
            max: 1,
        })).toEqual({
            min: 17697,
            q1: 33816,
            median: 49669,
            q3: 79297.5,
            max: 93514,
        });
    });
});
