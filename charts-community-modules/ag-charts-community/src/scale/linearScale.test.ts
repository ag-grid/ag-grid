import { expect, test, describe, it } from '@jest/globals';
import { LinearScale } from './linearScale';

test('domain', () => {
    const scale = new LinearScale();

    expect(scale.domain).toEqual([0, 1]);
    scale.domain = [5, 10];
    expect(scale.domain).toEqual([5, 10]);
});

test('range', () => {
    const scale = new LinearScale();

    expect(scale.range).toEqual([0, 1]);
    scale.range = [5, 10];
    expect(scale.range).toEqual([5, 10]);
});

test('convert linear', () => {
    const scale = new LinearScale();

    scale.domain = [-100, 100];
    scale.range = [0, 100];

    expect(scale.convert(0, { strict: false })).toBe(50);

    expect(scale.convert(-100, { strict: false })).toBe(0);
    expect(scale.convert(100, { strict: false })).toBe(100);

    expect(scale.convert(-100, { strict: true })).toBe(0);
    expect(scale.convert(100, { strict: true })).toBe(100);
});

test('convert linear clamp', () => {
    const scale = new LinearScale();

    scale.domain = [-100, 100];
    scale.range = [0, 100];

    expect(scale.convert(-300, { strict: false })).toBe(0);
    expect(scale.convert(300, { strict: false })).toBe(100);

    expect(scale.convert(-300, { strict: true })).toBeNaN();
    expect(scale.convert(300, { strict: true })).toBeNaN();
});

test('convert linear with zero width domain', () => {
    const scale = new LinearScale();

    scale.domain = [100, 100];
    scale.range = [0, 100];

    expect(scale.convert(100, { strict: false })).toBe(50);
});

test('invert linear', () => {
    const scale = new LinearScale();

    scale.domain = [-100, 100];
    scale.range = [0, 100];

    expect(scale.invert(50)).toBe(0);
    expect(scale.invert(0)).toBe(-100);
    expect(scale.invert(75)).toBe(50);
});

test('invert linear with zero length range', () => {
    const scale = new LinearScale();

    scale.domain = [0, 100];
    scale.range = [100, 100];

    expect(scale.invert(100)).toBe(50);
});

describe('should create ticks', () => {
    const CASES = [
        {
            interval: 0,
            domain: [-1, 1],
        },
        {
            interval: 1,
            domain: [0, 10],
        },
        {
            interval: 3,
            domain: [-3, 12],
        },
        {
            interval: 10.5,
            domain: [0, 102],
        },
        {
            interval: 133,
            domain: [0, 665],
        },
        {
            interval: -1,
            domain: [0, 10],
        },
        {
            interval: -1,
            domain: [-10, 0],
        },
        {
            interval: -7.5,
            domain: [-37.5, -7.5],
        },
        {
            interval: 0.1,
            domain: [0, 1],
        },
        {
            interval: 0.01,
            domain: [0.1, 0.2],
        },
        {
            interval: 0.005,
            domain: [0.01, 0.02],
        },
    ];

    const TEST_CASES_MAP = CASES.reduce((map, obj) => {
        map[`interval: ${obj.interval} domain: [${obj.domain[0]}, ${obj.domain[1]}]`] = obj;
        return map;
    }, {});

    it.each(Object.keys(TEST_CASES_MAP))(`for %s case`, (caseName) => {
        const { interval, domain } = TEST_CASES_MAP[caseName];
        const scale = new LinearScale();

        scale.range = [0, 600];
        scale.domain = domain;
        scale.interval = interval;

        expect(scale.ticks()).toMatchSnapshot();
    });
});
