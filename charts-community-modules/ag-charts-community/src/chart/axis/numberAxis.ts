import { LinearScale } from '../../scale/linearScale';
import { LogScale } from '../../scale/logScale';
import { extent } from '../../util/array';
import { ChartAxis } from '../chartAxis';
import { Validate, GREATER_THAN, AND, LESS_THAN, NUMBER_OR_NAN } from '../../util/validation';
import { Default } from '../../util/default';
import { calculateNiceSecondaryAxis } from '../../util/secondaryAxisTicks';
import { Logger } from '../../util/logger';
import { ModuleContext } from '../../module-support';

export class NumberAxis extends ChartAxis<LinearScale | LogScale, number> {
    static className = 'NumberAxis';
    static type = 'number' as 'number' | 'log';

    constructor(moduleCtx: ModuleContext, scale = new LinearScale() as LinearScale | LogScale) {
        super(scale, moduleCtx);
        scale.strictClampByDefault = true;
    }

    normaliseDataDomain(d: number[]) {
        const { min, max } = this;

        if (d.length > 2) {
            d = extent(d) || [NaN, NaN];
        }
        if (!isNaN(min)) {
            d = [min, d[1]];
        }
        if (!isNaN(max)) {
            d = [d[0], max];
        }
        if (d[0] > d[1]) {
            d = [];
        }

        return d;
    }

    @Validate(AND(NUMBER_OR_NAN(), LESS_THAN('max')))
    @Default(NaN)
    min: number = NaN;

    @Validate(AND(NUMBER_OR_NAN(), GREATER_THAN('min')))
    @Default(NaN)
    max: number = NaN;

    formatDatum(datum: number): string {
        if (typeof datum === 'number') {
            return datum.toFixed(2);
        } else {
            Logger.warnOnce(
                'data contains Date objects which are being plotted against a number axis, please only use a number axis for numbers.'
            );
            return String(datum);
        }
    }

    updateSecondaryAxisTicks(primaryTickCount: number | undefined): any[] {
        if (this.dataDomain == null) {
            throw new Error('AG Charts - dataDomain not calculated, cannot perform tick calculation.');
        }

        const [d, ticks] = calculateNiceSecondaryAxis(this.dataDomain, primaryTickCount ?? 0);

        this.scale.nice = false;
        this.scale.domain = d;
        this.scale.update();

        return ticks;
    }
}
