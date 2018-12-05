import ticks from "./ticks";

test('ticks', () => {
    const ticks_2_to_3 = [50];
    const ticks_4_to_6 = [20, 40, 60, 80];
    const ticks_7_to_13 = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    const ticks_14_30 = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];

    expect(ticks(2, 97, 1)).toEqual([]);
    expect(ticks(2, 97, 2)).toEqual(ticks_2_to_3);
    expect(ticks(2, 97, 3)).toEqual(ticks_2_to_3);
    expect(ticks(2, 97, 4)).toEqual(ticks_4_to_6);
    expect(ticks(2, 97, 5)).toEqual(ticks_4_to_6);
    expect(ticks(2, 97, 6)).toEqual(ticks_4_to_6);
    expect(ticks(2, 97, 7)).toEqual(ticks_7_to_13);
    expect(ticks(2, 97, 8)).toEqual(ticks_7_to_13);
    expect(ticks(2, 97, 9)).toEqual(ticks_7_to_13);
    expect(ticks(2, 97, 10)).toEqual(ticks_7_to_13);
    expect(ticks(2, 97, 20)).toEqual(ticks_14_30);
    expect(ticks(2, 97, 30)).toEqual(ticks_14_30);
});