import type { AgBaseAxisOptions } from '../../options/agChartOptions';
import type { ChartAxis } from '../chartAxis';
export declare class AxisPositionGuesser {
    private result;
    private valid;
    private invalid;
    push(axis: ChartAxis, options: AgBaseAxisOptions): void;
    guessInvalidPositions(): ChartAxis[];
}
