import { RangeMask } from './shapes/rangeMask';

export class NavigatorMask {
    private readonly rm: RangeMask;

    set fill(value: string | undefined) {
        this.rm.fill = value;
    }
    get fill(): string | undefined {
        return this.rm.fill;
    }

    set stroke(value: string | undefined) {
        this.rm.stroke = value;
    }
    get stroke(): string | undefined {
        return this.rm.stroke;
    }

    set strokeWidth(value: number) {
        this.rm.strokeWidth = value;
    }
    get strokeWidth(): number {
        return this.rm.strokeWidth;
    }

    set fillOpacity(value: number) {
        this.rm.fillOpacity = value;
    }
    get fillOpacity(): number {
        return this.rm.fillOpacity;
    }

    constructor(rangeMask: RangeMask) {
        this.rm = rangeMask;
    }
}
