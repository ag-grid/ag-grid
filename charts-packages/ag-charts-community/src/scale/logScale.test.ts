import { expect, test, describe, it } from '@jest/globals';
import { NumericTicks } from '../util/ticks';
import { LogScale } from './logScale';

test('ticks', () => {
    {
        const scale = new LogScale();
        scale.domain = [100, 1000000];
        expect(scale.ticks()).toEqual([
            100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
            20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 200000, 300000, 400000, 500000, 600000,
            700000, 800000, 900000, 1000000,
        ]);
        scale.tickCount = 4;
        expect(scale.ticks()).toEqual(new NumericTicks(5, [100, 1000, 10000, 100000, 1000000]));
    }

    {
        // const scale = new LogScale();
        // scale.domain = [-100, 10000];
        // expect(scale.ticks()).toEqual([]);
    }

    {
        const scale = new LogScale();
        scale.domain = [-1000, -10];
        expect(scale.ticks()).toEqual([
            -1000, -900, -800, -700, -600, -500, -400, -300, -200, -100, -90, -80, -70, -60, -50, -40, -30, -20, -10,
        ]);
    }
});

describe('should create ticks', () => {
    const CASES = [
        {
            interval: 0,
            domain: [0.1, 10000000],
        },
        {
            interval: 1,
            domain: [0.1, 10000000],
        },
        {
            interval: -1,
            domain: [-10000000, -0.1],
        },
        {
            interval: 1,
            domain: [-10000000, -0.1],
        },
        {
            interval: 2,
            domain: [0.1, 10000000],
        },
        {
            interval: 3,
            domain: [0.1, 10000000],
        },
        {
            interval: 4,
            domain: [0.1, 10000000],
        },
        {
            interval: 5,
            domain: [0.1, 10000000],
        },
        {
            interval: 6,
            domain: [0.1, 10000000],
        },
        {
            interval: 7,
            domain: [0.1, 10000000],
        },
        {
            interval: 10,
            domain: [0.1, 10000000],
        },
        {
            interval: 0.5,
            domain: [0.1, 10000000],
        },
        {
            interval: 0.1,
            domain: [0.1, 10000000],
        },
        {
            interval: 2,
            domain: [-10000000, -0.1],
        },
        {
            interval: -2,
            domain: [-10000000, -0.1],
        },
        {
            interval: 10,
            domain: [-10000000, -0.1],
        },
        {
            interval: -10,
            domain: [-10000000, -0.1],
        },
    ];

    const TEST_CASES_MAP = CASES.reduce((map, obj) => {
        map[`interval: ${obj.interval} domain: [${obj.domain[0]}, ${obj.domain[1]}]`] = obj;
        return map;
    }, {});

    it.each(Object.keys(TEST_CASES_MAP))(`for %s case`, (caseName) => {
        const { interval, domain } = TEST_CASES_MAP[caseName];
        const scale = new LogScale();

        scale.range = [0, 600];
        scale.domain = domain;
        scale.interval = interval;

        expect(scale.ticks()).toMatchSnapshot();
    });
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

test('base', () => {
    const expTicks = new NumericTicks(
        4,
        [20.085536923187668, 54.598150033144236, 148.4131591025766, 403.4287934927351]
    );
    const scale = new LogScale();
    scale.domain = [10, 1000];
    expect(scale.ticks()).not.toEqual(expTicks);
    scale.base = Math.E;
    expect(scale.ticks()).toEqual(expTicks);
});

test('nice', () => {
    {
        const scale = new LogScale();
        scale.domain = [57, 775];
        scale.nice = true;
        scale.update();
        expect(scale.nice).toBe(true);
        expect(scale.niceDomain).toEqual([10, 1000]);
    }

    {
        const scale = new LogScale();
        scale.domain = [Math.E * 1.234, Math.E * 5.783];
        scale.base = Math.E;
        scale.nice = true;
        scale.update();
        const domain = scale.niceDomain;
        expect(Math.log(domain[0])).toEqual(1);
        expect(Math.log(domain[1])).toEqual(3);
    }
});
