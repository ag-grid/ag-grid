/**
 * The chart features the preview can turn on. Not a list of everything a chart
 * can do - a feature earns a place only by putting something the editor panel
 * edits on screen, which a plain chart leaves invisible.
 */
export const CHART_FEATURE_IDS = [
    'seriesStrokes',
    'legend',
    'crosshairs',
    'contextMenu',
    'zoom',
    'navigator',
    'rangeButtons',
    'toolbar',
    'statusBar',
    'volume',
] as const;

export type ChartFeatureId = (typeof CHART_FEATURE_IDS)[number];

export type ChartFeatures = Partial<Record<ChartFeatureId, boolean>>;

export interface ChartFeatureConfig {
    id: ChartFeatureId;
    label: string;
    /** What it puts on screen, since half of these are invisible until used. */
    hint: string;
    /**
     * A feature this one cannot work without. The chart ignores it silently when
     * the requirement is off, so the popup disables the checkbox and says why.
     */
    requires?: ChartFeatureId;
}

export const CHART_FEATURES: ChartFeatureConfig[] = [
    {
        id: 'seriesStrokes',
        label: 'Series Strokes',
        hint: 'Outlines each series in its palette stroke, which charts hide by default',
    },
    { id: 'legend', label: 'Legend', hint: 'Series names, and its pager once they overflow' },
    { id: 'crosshairs', label: 'Crosshairs', hint: 'Axis labels on hover - hover the chart to see them' },
    { id: 'contextMenu', label: 'Context Menu', hint: 'Menu colours - right-click the chart to open it' },
    { id: 'zoom', label: 'Zoom', hint: 'Zoom buttons, and scrolling to zoom' },
    { id: 'navigator', label: 'Navigator', hint: 'The scrollbar and mini chart below the axis' },
    {
        id: 'rangeButtons',
        label: 'Range Buttons',
        hint: 'The 1M / 3M / 1Y row - chrome colours and fonts',
        // A range button sets a zoom, so the chart drops the row without one.
        requires: 'zoom',
    },
    { id: 'toolbar', label: 'Drawing Tools', hint: 'The annotation toolbar, its buttons and settings panel' },
    { id: 'statusBar', label: 'Status Bar', hint: 'The open / high / low / close readout above the chart' },
    { id: 'volume', label: 'Volume', hint: 'A second series and axis below the price' },
];

/**
 * On by default, because a feature nobody switches on is a param nobody sees.
 * Volume is the exception: it takes a fifth of the series area for a series the
 * theme treats no differently from any other.
 */
export const DEFAULT_CHART_FEATURES: ChartFeatures = {
    seriesStrokes: true,
    legend: true,
    crosshairs: true,
    contextMenu: true,
    zoom: true,
    navigator: true,
    rangeButtons: true,
    toolbar: true,
    statusBar: true,
    volume: false,
};

const FEATURE_BY_ID: Record<ChartFeatureId, ChartFeatureConfig> = Object.fromEntries(
    CHART_FEATURES.map((feature) => [feature.id, feature])
) as Record<ChartFeatureId, ChartFeatureConfig>;

/** What the user last chose, for a record that may predate the feature. */
export const isFeatureEnabled = (features: ChartFeatures, id: ChartFeatureId): boolean =>
    features[id] ?? DEFAULT_CHART_FEATURES[id] ?? false;

/**
 * Chosen, and with anything it depends on chosen too. The choice itself is never
 * written back as false, so switching zoom off and on returns the range buttons.
 */
export const isFeatureActive = (features: ChartFeatures, id: ChartFeatureId): boolean => {
    const { requires } = FEATURE_BY_ID[id];
    return isFeatureEnabled(features, id) && (requires == null || isFeatureActive(features, requires));
};
