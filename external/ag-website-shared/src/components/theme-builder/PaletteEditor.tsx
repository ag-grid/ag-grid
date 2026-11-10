import styled from '@emotion/styled';
import { Link2, Plus, Trash2, Unlink2 } from 'lucide-react';

import { ColorPicker } from './ColorPicker';
import { FormField } from './FormField';
import {
    PALETTE_ACCENT_KEYS,
    type Palette,
    type PaletteAccent,
    type PaletteAccentKey,
    type SeriesColor,
    type StrokeDirection,
    deriveStroke,
    fromSeriesColors,
    resolveAccent,
    strokeIsDerived,
    toSeriesColors,
    withAccentColors,
    withAccentFill,
    withAccentStroke,
    withDerivedAccentStroke,
    withDerivedStroke,
    withFill,
    withStroke,
} from './palette';

/**
 * Editor for a chart series palette - see `palette.ts` for why the shape is
 * shared. It is fully controlled: the host owns the state, whether that is a
 * single atom (AG Charts) or a set of numbered theme params (Studio).
 */
export interface PaletteEditorProps {
    value: Palette;
    onChange: (palette: Palette) => void;
    /**
     * Upper bound on series slots, if the host has one. Studio's theme declares a
     * fixed 20 palette params; AG Charts' palette array is unbounded.
     */
    maxSeriesColors?: number;
    /** Which way linked strokes move from their fill, following the theme's background. */
    strokeDirection?: StrokeDirection;
    /**
     * Whether the host's previews draw series strokes. Not part of the palette or
     * the theme: when false the series stroke inputs are greyed out, as they would
     * change nothing on screen.
     */
    seriesStrokesPreviewed?: boolean;
    /** Off for a host whose charts have no series that reads the up, down and neutral colours. */
    showSemanticColors?: boolean;
}

/** A new slot when there is no previous colour to clone - AG Charts' first fill. */
const FALLBACK_SERIES_FILL = '#5090dc';

const ACCENT_LABELS: Record<PaletteAccentKey, string> = {
    up: 'Up',
    down: 'Down',
    neutral: 'Neutral',
};

const SERIES_DOCS = 'Each series takes the next slot, cycling once a chart has more series than the palette.';

const SERIES_STROKE_DOCS =
    'Fills colour the series; strokes colour its outline. A linked stroke follows its fill, darker on a light background and lighter on a dark one; picking a colour for it unlinks it.';

const STROKES_DOCS =
    'Strokes are not switched on by a theme. Most series, bars included, draw one only when their own options set a stroke width, though box plots, candlesticks and treemap groups always do. Turn on Series Strokes in the preview features to see them; until then the series stroke inputs are greyed out.';

export const PaletteEditor = ({
    value,
    onChange,
    maxSeriesColors,
    strokeDirection = 'darken',
    seriesStrokesPreviewed = true,
    showSemanticColors = true,
}: PaletteEditorProps) => {
    const colors = toSeriesColors(value, strokeDirection);
    const canAdd = maxSeriesColors == null || colors.length < maxSeriesColors;

    const setColors = (next: SeriesColor[]) => onChange(fromSeriesColors(value, next));

    const setColor = (index: number, color: SeriesColor) =>
        setColors(colors.map((existing, i) => (i === index ? color : existing)));

    // The stroke the copied fill implies, rather than the last stroke: two
    // identical slots are a worse start than one that is self-consistent.
    const addColor = () => {
        const fill = colors[colors.length - 1]?.fill ?? FALLBACK_SERIES_FILL;
        setColors([...colors, { fill, stroke: deriveStroke(fill), strokeDerived: true }]);
    };

    const removeColor = (index: number) => setColors(colors.filter((_, i) => i !== index));

    return (
        <Fields>
            <FormField label="Series Colors" docs={`${SERIES_DOCS} ${SERIES_STROKE_DOCS} ${STROKES_DOCS}`}>
                <Rows>
                    <ColumnHeadings gutter={SERIES_LABEL_WIDTH} />
                    {colors.map((color, index) => (
                        <Row key={index}>
                            <SeriesIndex>{index + 1}</SeriesIndex>
                            <ColorPicker
                                preventTransparency={false}
                                ariaLabel={`Series color ${index + 1} fill`}
                                value={color.fill}
                                onChange={(fill) => setColor(index, withFill(color, fill ?? color.fill))}
                            />
                            <ColorPicker
                                preventTransparency={false}
                                ariaLabel={`Series color ${index + 1} stroke`}
                                value={color.stroke}
                                // Opening a linked stroke unlinks it, keeping the colour shown.
                                // Greyed out too while the previews hide strokes, but still
                                // editable: the theme exports the stroke either way.
                                muted={strokeIsDerived(color.strokeDerived) || !seriesStrokesPreviewed}
                                onOpen={
                                    strokeIsDerived(color.strokeDerived)
                                        ? () => setColor(index, withDerivedStroke(color, false))
                                        : undefined
                                }
                                // Cleared means "no stroke of my own", so it
                                // follows the fill. An accent differs below.
                                onChange={(stroke) =>
                                    setColor(
                                        index,
                                        stroke == null ? withDerivedStroke(color, true) : withStroke(color, stroke)
                                    )
                                }
                            />
                            <Controls>
                                <DeriveButton
                                    label={`series color ${index + 1}`}
                                    derived={strokeIsDerived(color.strokeDerived)}
                                    onChange={(derived) => setColor(index, withDerivedStroke(color, derived))}
                                />
                                <IconButton
                                    type="button"
                                    aria-label={`Remove series color ${index + 1}`}
                                    disabled={colors.length <= 1}
                                    onClick={() => removeColor(index)}
                                >
                                    <Trash2 size={14} />
                                </IconButton>
                            </Controls>
                        </Row>
                    ))}
                </Rows>
            </FormField>
            {canAdd && (
                <AddButton type="button" onClick={addColor}>
                    <Plus size={14} /> Add series color
                </AddButton>
            )}
            {/* One group rather than three fields, so the two columns are named
                once and the three rows read as the set they are. */}
            {showSemanticColors && (
                <FormField
                    label="Semantic Colors"
                    docs="Rising, falling and unchanged values, such as prices in candlestick, OHLC and HLC series. A palette that leaves these unset is treated as an indexed one, and those series fall back to the series colours above."
                >
                    <Rows>
                        <ColumnHeadings gutter={ACCENT_LABEL_WIDTH} />
                        {PALETTE_ACCENT_KEYS.map((key) => (
                            <AccentEditor
                                key={key}
                                label={ACCENT_LABELS[key]}
                                value={resolveAccent(value[key], strokeDirection)}
                                onChange={(accent) => onChange(withAccentColors(value, key, accent))}
                            />
                        ))}
                    </Rows>
                </FormField>
            )}
        </Fields>
    );
};

/**
 * Headings for the two swatch columns, whose order is not guessable. Each swatch
 * also names itself, a screen reader not reading a heading as a label.
 * `gutter` is the width of the row-label column these sit beside.
 */
const ColumnHeadings = ({ gutter }: { gutter: number }) => (
    <Row>
        <RowLabel style={{ width: gutter }} />
        <ColumnHeading>Fill</ColumnHeading>
        <ColumnHeading>Stroke</ColumnHeading>
        <Controls>
            <TrailingGutter />
            <TrailingGutter />
        </Controls>
    </Row>
);

interface AccentEditorProps {
    label: string;
    value: PaletteAccent | undefined;
    onChange: (value: PaletteAccent) => void;
}

const AccentEditor = ({ label, value, onChange }: AccentEditorProps) => (
    <Row>
        <RowLabel>{label}</RowLabel>
        <ColorPicker
            preventTransparency={false}
            ariaLabel={`${label} fill`}
            value={value?.fill ?? ''}
            onChange={(fill) => onChange(withAccentFill(value, fill ?? undefined))}
        />
        <ColorPicker
            preventTransparency={false}
            ariaLabel={`${label} stroke`}
            value={value?.stroke ?? ''}
            muted={strokeIsDerived(value?.strokeDerived)}
            onOpen={
                strokeIsDerived(value?.strokeDerived)
                    ? () => onChange(withDerivedAccentStroke(value, false))
                    : undefined
            }
            onChange={(stroke) => onChange(withAccentStroke(value, stroke ?? undefined))}
        />
        <Controls>
            <DeriveButton
                label={label.toLowerCase()}
                derived={strokeIsDerived(value?.strokeDerived)}
                onChange={(derived) => onChange(withDerivedAccentStroke(value, derived))}
            />
            {/* Matches the series rows' remove button, so both groups end flush. */}
            <TrailingGutter />
        </Controls>
    </Row>
);

interface DeriveButtonProps {
    /** What this row is, for the button's own label. */
    label: string;
    derived: boolean;
    onChange: (derived: boolean) => void;
}

/**
 * The switch between a stroke that follows its fill and one the user owns. A
 * toggle rather than a one-way action, because the two states look identical
 * until the fill changes, so the state itself is worth showing.
 */
const DeriveButton = ({ label, derived, onChange }: DeriveButtonProps) => (
    <IconButton
        type="button"
        aria-pressed={derived}
        aria-label={`Derive the ${label} stroke from its fill`}
        title={
            derived
                ? 'Stroke follows the fill - pick a colour to unlink it'
                : 'Stroke was set by hand - link it to the fill'
        }
        className={derived ? 'is-active' : undefined}
        onClick={() => onChange(!derived)}
    >
        {derived ? <Link2 size={14} /> : <Unlink2 size={14} />}
    </IconButton>
);

/** Enough for "Neutral" at the row font size, and no wider - the panel is 300px. */
const ACCENT_LABEL_WIDTH = 40;
/** Enough for a two-digit slot number. */
const SERIES_LABEL_WIDTH = 16;

const Fields = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Rows = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Row = styled('div')`
    display: flex;
    align-items: center;
    gap: 6px;

    // The two pickers share the row evenly; fill on the left, stroke on the right.
    > div {
        flex: 1;
        min-width: 0;
    }
`;

const RowLabel = styled('span')`
    width: ${ACCENT_LABEL_WIDTH}px;
    flex-shrink: 0;
    color: var(--color-fg-secondary);
    opacity: 0.6;
    font-size: 11px;
`;

// Right-aligned, so the numbers sit against the swatches they belong to rather
// than drifting away from them as the count passes nine.
const SeriesIndex = styled(RowLabel)`
    width: ${SERIES_LABEL_WIDTH}px;
    text-align: right;
`;

const ColumnHeading = styled('span')`
    flex: 1;
    min-width: 0;
    color: var(--color-fg-secondary);
    opacity: 0.6;
    font-size: 11px;
`;

const TrailingGutter = styled('span')`
    width: 14px;
    flex-shrink: 0;
`;

// The row's buttons, closer to each other than to the pickers so they read as
// one column. A span, or the row's rule for the pickers would stretch it.
const Controls = styled('span')`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;
`;

// `&&&` because the design system dresses a bare `button` as a filled primary
// button through pseudo-class rules, which outrank the single class Emotion
// generates - a plain `all: unset` holds only until the pointer arrives. The
// reset also drops the design system's focus ring, so one is supplied below.
const IconButton = styled('button')`
    &&& {
        all: unset;
        cursor: pointer;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        color: var(--color-fg-secondary);
        opacity: 0.6;

        &:hover:not(:disabled) {
            opacity: 1;
        }

        &:focus-visible {
            opacity: 1;
            outline: 2px solid var(--color-brand-500);
            outline-offset: 2px;
            border-radius: 2px;
        }

        &:disabled {
            cursor: default;
            opacity: 0.2;
        }

        // Linked is the default, so it is marked rather than shouted.
        &.is-active {
            opacity: 1;
            color: var(--color-fg-primary);
        }
    }
`;

// Same reset, and for the same reason - see `IconButton`.
const AddButton = styled('button')`
    &&& {
        all: unset;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        padding-left: 22px;
        color: var(--color-fg-secondary);
        font-size: 12px;

        &:hover {
            color: var(--color-fg-primary);
        }

        &:focus-visible {
            color: var(--color-fg-primary);
            outline: 2px solid var(--color-brand-500);
            outline-offset: 2px;
            border-radius: 2px;
        }
    }
`;
