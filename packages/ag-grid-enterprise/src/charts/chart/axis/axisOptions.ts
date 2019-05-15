import { Axis, GridStyle } from "../../axis";
import { CategoryAxis } from "./categoryAxis";
import { NumberAxis } from "./numberAxis";

export interface AxisOptions {
    type?: 'category' | 'number',

    lineWidth?: number,
    lineColor?: string,

    tickWidth?: number,
    tickSize?: number,
    tickPadding?: number,
    tickColor?: string,

    labelFont?: string,
    labelColor?: string,
    labelRotation?: number,
    mirrorLabels?: boolean,
    parallelLabels?: boolean,
    labelFormatter?: (value: any, fractionDigits?: number) => string,

    gridStyle?: GridStyle[]
}

export function makeAxis(options: AxisOptions): Axis {
    switch (options.type) {
        case 'category':
            return new CategoryAxis(options);
        case 'number':
            return new NumberAxis(options);
        default:
            throw new Error('Unknown axis type.');
    }
}

export function applyAxisOptions<D>(axis: Axis<D>, options: AxisOptions) {
    for (const name in options) {
        if (name === 'type') {
            continue;
        }
        const value = (options as any)[name];
        if (value !== undefined) {
            (axis as any)[name] = value;
        }
    }
}
