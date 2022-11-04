import { Scale } from '../scale/scale';
import { Axis } from '../axis';
import { Series } from './series/series';
import { LinearScale } from '../scale/linearScale';
import { POSITION, STRING_ARRAY, Validate } from '../util/validation';
import { AgCartesianAxisPosition } from './agChartOptions';

export enum ChartAxisDirection {
    X = 'x', // means 'angle' in polar charts
    Y = 'y', // means 'radius' in polar charts
}

export function flipChartAxisDirection(direction: ChartAxisDirection): ChartAxisDirection {
    if (direction === ChartAxisDirection.X) {
        return ChartAxisDirection.Y;
    } else {
        return ChartAxisDirection.X;
    }
}

export class ChartAxis<S extends Scale<any, number> = Scale<any, number>, D = any> extends Axis<S, D> {
    @Validate(STRING_ARRAY)
    keys: string[] = [];

    direction: ChartAxisDirection = ChartAxisDirection.Y;
    boundSeries: Series[] = [];
    linkedTo?: ChartAxis;
    includeInvisibleDomains: boolean = false;

    get type(): string {
        return (this.constructor as any).type || '';
    }

    protected useCalculatedTickCount() {
        // We only want to use the new algorithm for number axes. Category axes don't use a
        // calculated or user-supplied tick-count, and time axes need special handling depending on
        // the time-range involved.
        return this.scale instanceof LinearScale;
    }

    @Validate(POSITION)
    protected _position: AgCartesianAxisPosition = 'left';
    set position(value: AgCartesianAxisPosition) {
        if (this._position !== value) {
            this._position = value;
            switch (value) {
                case 'top':
                    this.direction = ChartAxisDirection.X;
                    this.rotation = -90;
                    this.label.mirrored = true;
                    this.label.parallel = true;
                    break;
                case 'right':
                    this.direction = ChartAxisDirection.Y;
                    this.rotation = 0;
                    this.label.mirrored = true;
                    this.label.parallel = false;
                    break;
                case 'bottom':
                    this.direction = ChartAxisDirection.X;
                    this.rotation = -90;
                    this.label.mirrored = false;
                    this.label.parallel = true;
                    break;
                case 'left':
                    this.direction = ChartAxisDirection.Y;
                    this.rotation = 0;
                    this.label.mirrored = false;
                    this.label.parallel = false;
                    break;
            }
        }
    }
    get position(): AgCartesianAxisPosition {
        return this._position;
    }

    protected calculateDomain() {
        const { direction, boundSeries, includeInvisibleDomains } = this;

        if (this.linkedTo) {
            this.dataDomain = this.linkedTo.dataDomain;
        } else {
            const domains: any[][] = [];
            boundSeries
                .filter((s) => includeInvisibleDomains || s.isEnabled())
                .forEach((series) => {
                    domains.push(series.getDomain(direction));
                });

            const domain = new Array<any>().concat(...domains);
            this.dataDomain = this.normaliseDataDomain(domain);
        }
    }

    normaliseDataDomain(d: D[]): D[] {
        return d;
    }

    isAnySeriesActive() {
        return this.boundSeries.some((s) => this.includeInvisibleDomains || s.isEnabled());
    }
}
