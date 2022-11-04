import { NumericTicks } from './ticks';

export function calculateNiceSecondaryAxis(
    domain: number[],
    primaryTickCount: number
): [[number, number], NumericTicks] {
    // Make secondary axis domain nice using strict tick count, matching the tick count from the primary axis.
    // This is to make the secondary axis grid lines/ tick positions align with the ones from the primary axis.
    let start = Math.floor(domain[0]);
    let stop = domain[1];

    start = calculateNiceStart(start, stop, primaryTickCount);
    const step = getTickStep(start, stop, primaryTickCount);

    const segments = primaryTickCount - 1;
    stop = start + segments * step;

    const d: [number, number] = [start, stop];
    const ticks = getTicks(start, step, primaryTickCount);

    return [d, ticks];
}

function calculateNiceStart(a: number, b: number, count: number): number {
    const rawStep = Math.abs(b - a) / (count - 1);
    const order = Math.floor(Math.log10(rawStep));
    const magnitude = Math.pow(10, order);

    return Math.floor(a / magnitude) * magnitude;
}

function getTicks(start: number, step: number, count: number): NumericTicks {
    // power of the step will be negative if the step is a fraction (between 0 and 1)
    const stepPower = Math.floor(Math.log10(step));
    const fractionDigits = step > 0 && step < 1 ? Math.abs(stepPower) : 0;

    const f = Math.pow(10, fractionDigits);

    const ticks = new NumericTicks(fractionDigits);

    for (let i = 0; i < count; i++) {
        const tick = start + step * i;
        ticks[i] = Math.round(tick * f) / f;
    }

    return ticks;
}

function getTickStep(start: number, stop: number, count: number): number {
    const segments = count - 1;
    const rawStep = (stop - start) / segments;
    return calculateNextNiceStep(rawStep);
}

function calculateNextNiceStep(rawStep: number): number {
    const order = Math.floor(Math.log10(rawStep));
    const magnitude = Math.pow(10, order);

    // Make order 1
    const step = (rawStep / magnitude) * 10;

    if (step > 0 && step <= 1) {
        return magnitude / 10;
    }
    if (step > 1 && step <= 2) {
        return (2 * magnitude) / 10;
    }
    if (step > 1 && step <= 5) {
        return (5 * magnitude) / 10;
    }
    if (step > 5 && step <= 10) {
        return (10 * magnitude) / 10;
    }
    if (step > 10 && step <= 20) {
        return (20 * magnitude) / 10;
    }
    if (step > 20 && step <= 40) {
        return (40 * magnitude) / 10;
    }
    if (step > 40 && step <= 50) {
        return (50 * magnitude) / 10;
    }
    if (step > 50 && step <= 100) {
        return (100 * magnitude) / 10;
    }

    return step;
}
