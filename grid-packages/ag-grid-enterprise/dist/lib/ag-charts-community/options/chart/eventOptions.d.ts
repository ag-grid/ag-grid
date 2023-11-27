interface AgChartEvent<T extends string> {
    type: T;
    event: Event;
}
export interface AgNodeBaseClickEvent<T extends string> extends AgChartEvent<T> {
    /** Event type. */
    type: T;
    /** Series ID, as specified in series.id (or generated if not specified) */
    seriesId: string;
    /** Datum from the chart or series data array. */
    datum: any;
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
export interface AgNodeClickEvent extends AgNodeBaseClickEvent<'seriesNodeClick'> {
}
export interface AgNodeDoubleClickEvent extends AgNodeBaseClickEvent<'seriesNodeDoubleClick'> {
}
export interface AgChartClickEvent extends AgChartEvent<'click'> {
}
export interface AgChartDoubleClickEvent extends AgChartEvent<'doubleClick'> {
}
export interface AgBaseChartListeners {
    /** The listener to call when a node (marker, column, bar, tile or a pie sector) in any series is clicked. In case a chart has multiple series, the chart's `seriesNodeClick` event can be used to listen to `nodeClick` events of all the series at once. */
    seriesNodeClick?: (event: AgNodeClickEvent) => any;
    /** The listener to call when a node (marker, column, bar, tile or a pie sector) in any series is double clicked. In case a chart has multiple series, the chart's `seriesNodeDoubleClick` event can be used to listen to `nodeDoubleClick` events of all the series at once. */
    seriesNodeDoubleClick?: (event: AgNodeDoubleClickEvent) => any;
    /** The listener to call to signify a general click on the chart by the user. */
    click?: (event: AgChartClickEvent) => any;
    /** The listener to call to signify a double click on the chart by the user. */
    doubleClick?: (event: AgChartDoubleClickEvent) => any;
}
export interface AgSeriesListeners<DatumType> {
    /** The listener to call when a node (marker, column, bar, tile or a pie sector) in the series is clicked. */
    nodeClick?: (params: AgSeriesNodeClickParams<DatumType>) => void;
    /** The listener to call when a node (marker, column, bar, tile or a pie sector) in the series is double clicked. */
    nodeDoubleClick?: (params: AgSeriesNodeClickParams<DatumType>) => void;
}
export interface AgSeriesNodeClickParams<DatumType> {
    /** Event type. */
    type: 'nodeClick';
    /** Series ID, as specified in series.id (or generated if not specified) */
    seriesId: string;
    /** Datum from the series data array. */
    datum: DatumType;
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
export {};
