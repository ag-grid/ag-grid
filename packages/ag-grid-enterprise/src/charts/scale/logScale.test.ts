import { LogScale } from "./logScale";

test('ticks', () => {
    {
        const scale = new LogScale();
        scale.domain = [100, 1000000];
        expect(scale.ticks()).toEqual([
            100,     200,    300,    400,    500,
            600,     700,    800,    900,    1000,
            2000,    3000,   4000,   5000,   6000,
            7000,    8000,   9000,   10000,  20000,
            30000,   40000,  50000,  60000,  70000,
            80000,   90000,  100000, 200000, 300000,
            400000,  500000, 600000, 700000, 800000,
            900000, 1000000
        ]);
        expect(scale.ticks(4)).toEqual([100, 1000, 10000, 100000, 1000000]);
    }

    {
        const scale = new LogScale();
        scale.domain = [-100, 10000];
        expect(scale.ticks()).toEqual([]);
    }

    {
        const scale = new LogScale();
        scale.domain = [-1000, -10];
        expect(scale.ticks()).toEqual([
            -1000, -900, -800, -700, -600, -500, -400, -300, -200, -100,
            -90, -80, -70, -60, -50, -40, -30, -20, -10
        ]);
    }
});

test('convert', () => {
    {
        const scale = new LogScale();
        scale.domain = [10, 1000];
        expect(scale.convert(50)).toBe(0.3494850021680094);
    }

    {
        const scale = new LogScale();
        scale.domain = [-1000, -10];
        expect(scale.convert(-50)).toBe(0.6505149978319906);
    }
});
