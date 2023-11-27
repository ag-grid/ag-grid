import type { FontOptions, Toggleable } from '../series/cartesian/commonOptions';
import type { AgChartCallbackParams } from './callbackOptions';
/**
 * Represents the configuration options for labels in an AgCharts.
 *
 * Labels are used to display textual information alongside data points in a chart.
 *
 * @typeparam TDatum - The type of data associated with the chart.
 * @typeparam TParams - The type of parameters expected by the label formatter function.
 */
export interface AgChartLabelOptions<TDatum, TParams> extends Toggleable, FontOptions {
    /** A custom formatting function used to convert data values into text for display by labels. */
    formatter?: (params: AgChartLabelFormatterParams<TDatum> & TParams) => string | undefined;
}
export interface AgChartLabelFormatterParams<TDatum> extends AgChartCallbackParams<TDatum> {
    /** The default label value that would have been used without a formatter. */
    value: any;
}
