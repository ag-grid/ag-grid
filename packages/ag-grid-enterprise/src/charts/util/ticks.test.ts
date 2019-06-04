import getTicks, { NumericTicks } from "./ticks";

function compareTicks(ticks: NumericTicks, array: number[]) {
    expect(ticks).toHaveLength(array.length);
    ticks.forEach((tick, index) => {
        expect(tick).toBe(array[index]);
    });
}

test('getTicks', () => {
    const ticks_2_to_3 = [50];
    const ticks_4_to_6 = [20, 40, 60, 80];
    const ticks_7_to_13 = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    const ticks_14_30 = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];

    expect(getTicks(2, 97, 1)).toHaveLength(0);
    compareTicks(getTicks(2, 97, 2), ticks_2_to_3);
    compareTicks(getTicks(2, 97, 3), ticks_2_to_3);
    compareTicks(getTicks(2, 97, 4), ticks_4_to_6);
    compareTicks(getTicks(2, 97, 5), ticks_4_to_6);
    compareTicks(getTicks(2, 97, 6), ticks_4_to_6);
    compareTicks(getTicks(2, 97, 7), ticks_7_to_13);
    compareTicks(getTicks(2, 97, 8), ticks_7_to_13);
    compareTicks(getTicks(2, 97, 9), ticks_7_to_13);
    compareTicks(getTicks(2, 97, 10), ticks_7_to_13);
    compareTicks(getTicks(2, 97, 20), ticks_14_30);
    compareTicks(getTicks(2, 97, 30), ticks_14_30);
});
