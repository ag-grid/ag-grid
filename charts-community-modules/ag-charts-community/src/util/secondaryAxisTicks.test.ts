import { expect, test } from '@jest/globals';
import { calculateNiceSecondaryAxis } from './secondaryAxisTicks';

function ticks(a: number, b: number, count: number): number[] {
    const [, ticks] = calculateNiceSecondaryAxis([a, b], count);
    return ticks;
}

test('ticks', () => {
    const ticks_49_216 = [40, 80, 120, 160, 200, 240];
    const ticks_0_216 = [0, 50, 100, 150, 200, 250];
    const ticks_100491_135198 = [100000, 104000, 108000, 112000, 116000, 120000, 124000, 128000, 132000, 136000];
    const ticks_1009_1018 = [1009, 1011, 1013, 1015, 1017, 1019];
    const ticks_7_26 = [7, 11, 15, 19, 23, 27];
    const ticks_n7_26 = [-7, -3, 1, 5, 9, 13, 17, 21, 25, 29];
    const ticks_1000_1002 = [1000, 1000.4, 1000.8, 1001.2, 1001.6, 1002, 1002.4, 1002.8, 1003.2, 1003.6];
    const ticks_n26_n7 = [-27, -23, -19, -15, -11, -7];
    const ticks_f002_f004 = [0, 0.001, 0.002, 0.003, 0.004, 0.005];
    const ticks_11_20 = [11, 13, 15, 17, 19, 21, 23, 25, 27];
    const ticks_0_101 = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180];

    compareTicks(ticks(49.9, 216.4, 6), ticks_49_216);
    compareTicks(ticks(0, 216.4, 6), ticks_0_216);
    compareTicks(ticks(100491, 135198, 10), ticks_100491_135198);
    compareTicks(ticks(1009.6, 1018.2, 6), ticks_1009_1018);
    compareTicks(ticks(7, 26.5, 6), ticks_7_26);
    compareTicks(ticks(-7, 26.5, 10), ticks_n7_26);
    compareTicks(ticks(1000, 1002, 10), ticks_1000_1002);
    compareTicks(ticks(-26.5, -7, 6), ticks_n26_n7);
    compareTicks(ticks(0.002, 0.004, 6), ticks_f002_f004);
    compareTicks(ticks(11, 20, 9), ticks_11_20);
    compareTicks(ticks(0, 101, 10), ticks_0_101);
});

function compareTicks(ticks: number[], array: number[]) {
    expect(ticks).toHaveLength(array.length);
    ticks.forEach((tick, index) => {
        expect(tick).toBe(array[index]);
    });
}
