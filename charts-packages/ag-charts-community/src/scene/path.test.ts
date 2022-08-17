import { expect, test } from '@jest/globals';
import { Path2D } from './path2D';

test('approximateCurve', () => {
    const path = new Path2D();
    path.approximateCurve([5, 45, -5, -40, 100, 25, 25, 20], 10);
    expect(path.commands).toEqual(['M', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L']);
    expect(path.params).toEqual([
        5, 45, 5.155, 23.78, 10.440000000000001, 10.240000000000002, 19.085000000000004, 3.0599999999999956, 29.32,
        0.9199999999999997, 39.375, 2.5, 47.48, 6.479999999999999, 51.865, 11.54, 50.760000000000005,
        16.359999999999996, 42.39500000000001, 19.620000000000005, 25.00000000000002, 20,
    ]);
});
