interface AgChartEvent<T extends string> {
    type: T;
    event: Event;
}
export interface AgNodeBaseClickEvent<TEvent extends string, TDatum> extends AgChartEvent<TEvent> {
    /** Event type. */
    type: TEvent;
    /** Series ID, as specified in series.id (or generated if not specified) */
    seriesId: string;
    /** Datum from the chart or series data array. */
    datum: TDatum;
    /** xKey as specified on series options */
    xKey?: string;
    /** yKey as specified on series options */
    yKey?: string;
    /** sizeKey as specified on series options */
    sizeKey?: string;
    /** labelKey as specified on series options */
    labelKey?: string;
    /** colorKey as specified on series options */
    colorKey?: string;
    /** angleKey as specified on series options */
    angleKey?: string;
    /** calloutLabelKey as specified on series options */
    calloutLabelKey?: string;
    /** sectorLabelKey as specified on series options */
    sectorLabelKey?: string;
    /** radiusKey as specified on series options */
    radiusKey?: string;
}
export interface AgSeriesNodeClickEvent<TDatum> extends AgNodeBaseClickEvent<'seriesNodeClick', TDatum> {
    /** Event type. */ type: 'seriesNodeClick';
}
export interface AgSeriesNodeDoubleClickEvent<TDatum> extends AgNodeBaseClickEvent<'seriesNodeDoubleClick', TDatum> {
    /** Event type. */ type: 'seriesNodeDoubleClick';
}
export interface AgNodeClickEvent<TDatum> extends AgNodeBaseClickEvent<'nodeClick', TDatum> {
    /** Event type. */ type: 'nodeClick';
}
export interface AgNodeDoubleClickEvent<TDatum> extends AgNodeBaseClickEvent<'nodeDoubleClick', TDatum> {
    /** Event type. */ type: 'nodeDoubleClick';
}
export interface AgChartClickEvent extends AgChartEvent<'click'> {
    /** Event type. */ type: 'click';
}
export interface AgChartDoubleClickEvent extends AgChartEvent<'doubleClick'> {
    /** Event type. */ type: 'doubleClick';
}
export interface AgBaseChartListeners<TDatum> {
    /** The listener to call when a node (marker, column, bar, tile or a pie sector) in any series is clicked.
     *  Useful for a chart containing multiple series.
     */
    seriesNodeClick?: (event: AgSeriesNodeClickEvent<TDatum>) => any;
    /** The listener to call when a node (marker, column, bar, tile or a pie sector) in any series is double clicked.
     * Useful for a chart containing multiple series.*/
    seriesNodeDoubleClick?: (event: AgSeriesNodeDoubleClickEvent<TDatum>) => any;
    /** The listener to call when the chart is clicked. */
    click?: (event: AgChartClickEvent) => any;
    /** The listener to call when the chart is double clicked. */
    doubleClick?: (event: AgChartDoubleClickEvent) => any;
}
export interface AgSeriesListeners<TDatum> {
    /** The listener to call when a node (marker, column, bar, tile or a pie sector) in the series is clicked. */
    nodeClick?: (params: AgNodeClickEvent<TDatum>) => void;
    /** The listener to call when a node (marker, column, bar, tile or a pie sector) in the series is double clicked. */
    nodeDoubleClick?: (params: AgNodeDoubleClickEvent<TDatum>) => void;
}
export {};
