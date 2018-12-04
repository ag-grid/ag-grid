import { Deinterpolator, Reinterpolator } from "./scale";
import ContinuousScale from "./continuousScale";
import { naturalOrder } from "../util/compare";

export class LinearScale<R> extends ContinuousScale<R> {
    protected deinterpolatorOf(a: number, b: number): Deinterpolator<number> {
        const d = b - a;
        if (d === 0 || isNaN(d)) {
            return () => d;
        } else {
            return x => (x - a) / d;
        }
    }

    protected reinterpolatorOf(a: number, b: number): Reinterpolator<number> {
        const d = b - a;
        return t => a + d * t;
    }
}

export function reinterpolateNumber(a: number, b: number): Reinterpolator<number> {
    const d = b - a;
    return t => a + d * t;
}

function deinterpolateNumber(a: number, b: number): Deinterpolator<number> {
    const d = b - a;
    if (d === 0 || isNaN(d)) {
        return () => d;
    } else {
        return x => (x - a) / d;
    }
}

export default function scaleLinear() {
    const scale = new LinearScale<number>(reinterpolateNumber, deinterpolateNumber, naturalOrder);
    scale.range = [0, 1];
    return scale;
}