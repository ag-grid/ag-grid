import { describe, expect, it } from 'vitest';

import {
    CHART_FEATURES,
    CHART_FEATURE_IDS,
    type ChartFeatures,
    DEFAULT_CHART_FEATURES,
    isFeatureActive,
    isFeatureEnabled,
} from './chartFeatures';
import {
    DEFAULT_CHART_TYPE_IDS,
    PREVIEW_CHART_TYPES,
    PREVIEW_PANES,
    THUMBNAIL_OPTIONS,
    snapSeriesCount,
} from './chartTypes';
import {
    CANDLESTICK_DATA,
    DEFAULT_SERIES_COUNT,
    MAX_SERIES_COUNT,
    MIN_SERIES_COUNT,
    PREVIEW_DATA,
    PREVIEW_SERIES,
    SERIES_COUNT_OPTIONS,
    THUMBNAIL_SERIES_KEYS,
} from './previewData';
import { PREVIEW_MODULES } from './previewModules';

const seriesOf = (options: unknown) => (options as { series: unknown[] }).series;

/** Everything the count control can drive; the preset types build their own. */
const COUNTED_TYPES = PREVIEW_CHART_TYPES.filter((type) => type.countLabel != null);

const ALL_ON: ChartFeatures = Object.fromEntries(CHART_FEATURE_IDS.map((id) => [id, true]));

const ALL_OFF: ChartFeatures = Object.fromEntries(CHART_FEATURE_IDS.map((id) => [id, false]));

/** Wherever a series' outline width can be set - on the shape, or on its markers. */
const strokeWidthOf = (series: unknown) => {
    const { strokeWidth, marker } = series as { strokeWidth?: number; marker?: { strokeWidth?: number } };
    return strokeWidth ?? marker?.strokeWidth;
};

const SERIES_STROKE_TYPES = PREVIEW_CHART_TYPES.filter((type) => type.features.includes('seriesStrokes'));

const CANDLESTICK = PREVIEW_CHART_TYPES.find((type) => type.id === 'candlestick')!;

describe('preview chart types', () => {
    it('builds the requested number of series at every offered count', () => {
        for (const type of COUNTED_TYPES) {
            for (const count of SERIES_COUNT_OPTIONS) {
                const options = type.buildOptions(count, ALL_ON);
                // A donut carries one series whose slices come from the data, so
                // the count lands on the data rather than the series list.
                const actual =
                    type.id === 'donut' ? (options as { data: unknown[] }).data.length : seriesOf(options).length;
                expect(actual, `${type.id} @ ${count}`).toBe(count);
            }
        }
    });

    it('offers an ascending scale the data can actually support', () => {
        expect(SERIES_COUNT_OPTIONS).toEqual([...SERIES_COUNT_OPTIONS].sort((a, b) => a - b));
        expect(new Set(SERIES_COUNT_OPTIONS).size).toBe(SERIES_COUNT_OPTIONS.length);
        expect(MIN_SERIES_COUNT).toBe(SERIES_COUNT_OPTIONS[0]);
        expect(MAX_SERIES_COUNT).toBe(SERIES_COUNT_OPTIONS.at(-1));
        // The top of the scale is a claim about the data behind it: a shorter
        // list would render fewer series than the count says.
        expect(PREVIEW_SERIES.length).toBeGreaterThanOrEqual(MAX_SERIES_COUNT);
        // Otherwise the tool opens on a count its own control cannot show.
        expect(SERIES_COUNT_OPTIONS).toContain(DEFAULT_SERIES_COUNT);
    });

    it('names every series distinctly', () => {
        // The tail of the list is built from country names, so a repeat would
        // collapse two series onto one key and silently drop one of them.
        expect(new Set(PREVIEW_SERIES.map(({ key }) => key)).size).toBe(PREVIEW_SERIES.length);
        expect(new Set(PREVIEW_SERIES.map(({ name }) => name)).size).toBe(PREVIEW_SERIES.length);
    });

    it('snaps a stored count onto the scale', () => {
        for (const option of SERIES_COUNT_OPTIONS) {
            expect(snapSeriesCount(option)).toBe(option);
        }
        // A value from an older scale, or an edited storage entry, must land on
        // something the control can display rather than sitting between options.
        expect(snapSeriesCount(7)).toBe(8);
        expect(snapSeriesCount(0)).toBe(MIN_SERIES_COUNT);
        expect(snapSeriesCount(9000)).toBe(MAX_SERIES_COUNT);
        expect(snapSeriesCount(Number.NaN)).toBe(DEFAULT_SERIES_COUNT);
    });

    it('has a value for every series in every row', () => {
        // The count takes a prefix of PREVIEW_SERIES, so a key missing from one
        // quarter would show as a silent gap only at certain counts.
        for (const row of PREVIEW_DATA) {
            for (const { key } of PREVIEW_SERIES) {
                expect(typeof (row as Record<string, unknown>)[key], `${row.quarter}.${key}`).toBe('number');
            }
        }
    });

    it('keeps the thumbnail at a fixed eight, independent of the count', () => {
        // Deliberate: the cards separate themes from each other, and at a
        // user-chosen count of two the lookalike palettes would converge again.
        // The count control drives the panes only.
        expect(seriesOf(THUMBNAIL_OPTIONS).length).toBe(8);
        expect(THUMBNAIL_SERIES_KEYS.length).toBe(8);
    });

    it('has thumbnail data behind every band the card draws', () => {
        // The card takes a prefix of the rows, so a key missing from one of them
        // leaves a gap that reads as a palette one colour short rather than as a
        // chart with something wrong with it.
        const { data, series } = THUMBNAIL_OPTIONS as { data: Record<string, unknown>[]; series: unknown[] };
        for (const row of data) {
            for (const { yKey } of series as { yKey: string }[]) {
                expect(typeof row[yKey], `${String(row.period)}.${yKey}`).toBe('number');
            }
        }
    });

    it('offers only the features its chart type can show', () => {
        const known = new Set<string>(CHART_FEATURE_IDS);
        for (const type of PREVIEW_CHART_TYPES) {
            // A feature the popup lists but nothing knows about would render a
            // checkbox that silently changes nothing.
            for (const id of type.features) {
                expect(known.has(id), `${type.id}: ${id}`).toBe(true);
            }
            expect(new Set(type.features).size, type.id).toBe(type.features.length);
            expect(type.features.length, type.id).toBeGreaterThan(0);
        }
    });

    it('describes every feature exactly once', () => {
        // The popup renders from CHART_FEATURES but the types name ids, so a
        // feature missing a description would vanish from the popup entirely.
        expect(CHART_FEATURES.map(({ id }) => id).toSorted()).toEqual([...CHART_FEATURE_IDS].toSorted());
        for (const id of CHART_FEATURE_IDS) {
            expect(DEFAULT_CHART_FEATURES[id], id).toBeTypeOf('boolean');
        }
    });

    it('falls back to the default for a feature a stored record predates', () => {
        expect(isFeatureEnabled({}, 'navigator')).toBe(DEFAULT_CHART_FEATURES.navigator);
        expect(isFeatureEnabled({ navigator: false }, 'navigator')).toBe(false);
        expect(isFeatureEnabled({ navigator: false }, 'legend')).toBe(DEFAULT_CHART_FEATURES.legend);
    });

    it('holds a feature off while what it needs is off, without forgetting it', () => {
        for (const { id, requires } of CHART_FEATURES) {
            if (!requires) continue;
            // Range buttons are a zoom, so the chart drops the row without one.
            // The checkbox has to say so rather than sit ticked over nothing.
            expect(isFeatureActive({ ...ALL_ON, [requires]: false }, id), id).toBe(false);
            expect(isFeatureEnabled({ ...ALL_ON, [requires]: false }, id), id).toBe(true);
            expect(isFeatureActive(ALL_ON, id), id).toBe(true);
        }
        // Otherwise a requirement could name a feature its own type cannot show.
        for (const type of PREVIEW_CHART_TYPES) {
            for (const { id, requires } of CHART_FEATURES) {
                if (!requires || !type.features.includes(id)) continue;
                expect(type.features, `${type.id}: ${id}`).toContain(requires);
            }
        }
    });

    it('turns every feature it offers into an option change', () => {
        // Each id has to reach the options object under some name, or the
        // checkbox is decoration. Compared as JSON because the difference can be
        // nested (an axis crosshair) or top-level (a preset flag).
        for (const type of PREVIEW_CHART_TYPES) {
            for (const id of type.features) {
                const on = JSON.stringify(type.buildOptions(DEFAULT_SERIES_COUNT, { ...ALL_ON, [id]: true }));
                const off = JSON.stringify(type.buildOptions(DEFAULT_SERIES_COUNT, { ...ALL_ON, [id]: false }));
                expect(on, `${type.id}: ${id}`).not.toBe(off);
            }
        }
    });

    it('gives the candlestick preview enough history for the range buttons', () => {
        // The buttons offer 1M through 1Y; anything shorter than a year leaves
        // most of them disabled, which is a row of dead chrome.
        const first = CANDLESTICK_DATA.at(0)!.date;
        const last = CANDLESTICK_DATA.at(-1)!.date;
        const years = (last.getTime() - first.getTime()) / (365 * 24 * 60 * 60 * 1000);
        expect(years).toBeGreaterThan(1.5);

        for (const candle of CANDLESTICK_DATA) {
            // A high below its own body, or a low above it, draws a candle
            // inside out - the kind of thing a walk can produce and nobody
            // notices among five hundred bars.
            expect(candle.high).toBeGreaterThanOrEqual(Math.max(candle.open, candle.close));
            expect(candle.low).toBeLessThanOrEqual(Math.min(candle.open, candle.close));
            expect(candle.low).toBeGreaterThan(0);
            // Weekends are skipped so the ordinal-time axis has no gaps to draw.
            expect([1, 2, 3, 4, 5]).toContain(candle.date.getDay());
        }
    });

    it('registers a module for every preset a preview type is built through', () => {
        // A preset is resolved by name at creation, so without its module the
        // options never expand into a series - and nothing reports an error.
        const registered = new Set(
            PREVIEW_MODULES.filter((module) => module.type === 'preset').map((module) => module.name)
        );
        for (const { id, preset } of PREVIEW_CHART_TYPES) {
            if (preset == null) continue;
            expect([...registered], `${id}: ${preset}`).toContain(preset);
        }
    });

    it('draws a series outline for the palette strokes to appear in', () => {
        // `strokeWidth` resolves to zero unless a stroke is asked for, which
        // leaves the palette editor's strokes column changing nothing visible.
        for (const type of SERIES_STROKE_TYPES) {
            for (const series of seriesOf(type.buildOptions(DEFAULT_SERIES_COUNT, ALL_ON))) {
                expect(strokeWidthOf(series), type.id).toBeGreaterThan(0);
            }
        }
    });

    it('leaves the outline to the chart once the feature is off', () => {
        // The switch has to be a switch: setting a width unconditionally would
        // make every preview an outlined chart, which is not what the theme
        // being built produces.
        for (const type of SERIES_STROKE_TYPES) {
            for (const series of seriesOf(type.buildOptions(DEFAULT_SERIES_COUNT, ALL_OFF))) {
                expect(strokeWidthOf(series), type.id).toBeUndefined();
            }
        }
    });

    it('offers the candlestick no switch for its stroke', () => {
        // Two years of daily candles are a shade over a pixel wide, and below
        // three AG Charts draws the wick line alone - so the stroke is not an
        // outline round the candle, it is the candle, and a switch for it could
        // only blank the series.
        expect(CANDLESTICK.features).not.toContain('seriesStrokes');
    });

    it('points every tooltip target at a series the options actually carry', () => {
        // The target is a `seriesId` handed back to the chart, so it is only as
        // good as the ids the options set: a series left to AG Charts' generated
        // id could not be named, and the held-open tooltip would simply not open.
        for (const type of PREVIEW_CHART_TYPES) {
            const { tooltipTarget } = type;
            if (!tooltipTarget) continue;
            for (const count of type.countLabel ? SERIES_COUNT_OPTIONS : [DEFAULT_SERIES_COUNT]) {
                const options = type.buildOptions(count, ALL_ON);
                const ids = seriesOf(options).map((series) => (series as { id?: string }).id);
                expect(ids, `${type.id} @ ${count}`).toContain(tooltipTarget.seriesId);
            }
        }
    });

    it('points every tooltip target at a datum the data actually has', () => {
        // A numeric `itemId` is a datum index, so one past the end of the data
        // matches nothing - and the tooltip that is the whole point of holding
        // the state open never appears.
        for (const type of PREVIEW_CHART_TYPES) {
            const { tooltipTarget } = type;
            if (!tooltipTarget) continue;
            const { data } = type.buildOptions(DEFAULT_SERIES_COUNT, ALL_ON) as { data: unknown[] };
            expect(tooltipTarget.itemId, type.id).toBeLessThan(data.length);
            expect(tooltipTarget.itemId, type.id).toBeGreaterThanOrEqual(0);
        }
    });

    it('leaves the preset types without a tooltip target', () => {
        // A preset assembles its own series, whose ids are generated - so there
        // is nothing for the panel to name, and the tooltip params fall back to
        // being edited without a live example.
        for (const type of PREVIEW_CHART_TYPES.filter(({ preset }) => preset != null)) {
            expect(type.tooltipTarget, type.id).toBeUndefined();
        }
    });

    it('opens the two panes on two chart types that exist', () => {
        // An id missing from the list falls back to the first type without
        // complaint, so a rename would silently open both panes on the same
        // chart - losing the comparison the second pane is there to make.
        const ids = PREVIEW_PANES.map((pane) => DEFAULT_CHART_TYPE_IDS[pane]);
        for (const id of ids) {
            expect(
                PREVIEW_CHART_TYPES.map((type) => type.id),
                id
            ).toContain(id);
        }
        expect(new Set(ids).size, ids.join(' and ')).toBe(ids.length);
    });
});
