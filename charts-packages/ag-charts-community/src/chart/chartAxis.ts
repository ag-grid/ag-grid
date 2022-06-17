import { Scale } from "../scale/scale";
import { Axis } from "../axis";
import { Series } from "./series/series";
import { LinearScale } from "../scale/linearScale";

export enum ChartAxisDirection {
    X = 'x', // means 'angle' in polar charts
    Y = 'y'  // means 'radius' in polar charts
}

export function flipChartAxisDirection(direction: ChartAxisDirection): ChartAxisDirection {
    if (direction === ChartAxisDirection.X) {
        return ChartAxisDirection.Y;
    } else {
        return ChartAxisDirection.X;
    }
}

export enum ChartAxisPosition {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left',
    Angle = 'angle',
    Radius = 'radius'
}

interface ChartAxisMeta {
    id: string;
    direction: ChartAxisDirection;
    boundSeries: Series[];
}

export class ChartAxis<S extends Scale<any, number> = Scale<any, number>> extends Axis<S> {
    keys: string[] = [];
    direction: ChartAxisDirection = ChartAxisDirection.Y;
    boundSeries: Series[] = [];
    linkedTo?: ChartAxis;

    get type(): string {
        return (this.constructor as any).type || '';
    }

    getMeta(): ChartAxisMeta {
        return {
            id: this.id,
            direction: this.direction,
            boundSeries: this.boundSeries,
        };
    }

    protected useCalculatedTickCount() {
        // We only want to use the new algorithm for number axes. Category axes don't use a
        // calculated or user-supplied tick-count, and time axes need special handling depending on
        // the time-range involved.
        return this.scale instanceof LinearScale;
    }

    /**
     * For continuous axes, if tick count has not been specified, set the number of ticks based on the available range
     */
    calculateTickCount(): void {
        if (!this.useCalculatedTickCount()) { return; }

        const [min, max] = this.range;
        const availableRange = Math.abs(max - min);

        // Approximate number of pixels to allocate for each tick.
        const optimalRangePx = 600;
        const optimalTickInteralPx = 70;
        const tickIntervalRatio = Math.pow(Math.log(availableRange) / Math.log(optimalRangePx), 2);
        const tickInterval = optimalTickInteralPx * tickIntervalRatio;
        this._calculatedTickCount = this.tick.count || Math.max(2, Math.floor(availableRange / tickInterval));
    }

    protected _position: ChartAxisPosition = ChartAxisPosition.Left;
    set position(value: ChartAxisPosition) {
        if (this._position !== value) {
            this._position = value;
            switch (value) {
                case ChartAxisPosition.Top:
                    this.direction = ChartAxisDirection.X;
                    this.rotation = -90;
                    this.label.mirrored = true;
                    this.label.parallel = true;
                    break;
                case ChartAxisPosition.Right:
                    this.direction = ChartAxisDirection.Y;
                    this.rotation = 0;
                    this.label.mirrored = true;
                    this.label.parallel = false;
                    break;
                case ChartAxisPosition.Bottom:
                    this.direction = ChartAxisDirection.X;
                    this.rotation = -90;
                    this.label.mirrored = false;
                    this.label.parallel = true;
                    break;
                case ChartAxisPosition.Left:
                    this.direction = ChartAxisDirection.Y;
                    this.rotation = 0;
                    this.label.mirrored = false;
                    this.label.parallel = false;
                    break;
            }
        }
    }
    get position(): ChartAxisPosition {
        return this._position;
    }

    calculateDomain({ primaryTickCount }: { primaryTickCount?: number }) {
        const { direction, boundSeries } = this;

        if (boundSeries.length === 0) {
            console.warn('AG Charts - chart series not initialised; check series and axes configuration.');
        }

        if (this.linkedTo) {
            this.domain = this.linkedTo.domain;
        } else {
            const domains: any[][] = [];
            boundSeries.filter(s => s.visible).forEach(series => {
                domains.push(series.getDomain(direction));
            });

            const domain = new Array<any>().concat(...domains);
            const isYAxis = this.direction === 'y';
            primaryTickCount = this.updateDomain(domain, isYAxis, primaryTickCount);
        }

        return { primaryTickCount };
    }

    protected updateDomain(domain: any[], _isYAxis: boolean, primaryTickCount?: number) {
        this.domain = domain;
        return primaryTickCount;
    }
}
