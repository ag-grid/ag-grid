import { RangeHandle } from './shapes/rangeHandle';

export class NavigatorHandle {
    private readonly rh: RangeHandle;

    set fill(value: string | undefined) {
        this.rh.fill = value;
    }
    get fill(): string | undefined {
        return this.rh.fill;
    }

    set stroke(value: string | undefined) {
        this.rh.stroke = value;
    }
    get stroke(): string | undefined {
        return this.rh.stroke;
    }

    set strokeWidth(value: number) {
        this.rh.strokeWidth = value;
    }
    get strokeWidth(): number {
        return this.rh.strokeWidth;
    }

    set width(value: number) {
        this.rh.width = value;
    }
    get width(): number {
        return this.rh.width;
    }

    set height(value: number) {
        this.rh.height = value;
    }
    get height(): number {
        return this.rh.height;
    }

    set gripLineGap(value: number) {
        this.rh.gripLineGap = value;
    }
    get gripLineGap(): number {
        return this.rh.gripLineGap;
    }

    set gripLineLength(value: number) {
        this.rh.gripLineLength = value;
    }
    get gripLineLength(): number {
        return this.rh.gripLineLength;
    }

    constructor(rangeHandle: RangeHandle) {
        this.rh = rangeHandle;
    }
}
