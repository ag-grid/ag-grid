import styled from '@emotion/styled';
import { useMemo } from 'react';

import { ChartPreview } from './ChartPreview';
import { PreviewOptions } from './PreviewOptions';
import {
    PREVIEW_PANE_LABELS,
    type PreviewPaneId,
    usePreviewChartType,
    usePreviewFeatures,
    usePreviewSeriesCount,
} from './chartTypes';
import type { ChartsTheme } from './chartsThemeOutput';
import { useSetEditedGroup } from './editedGroup';

interface Props {
    pane: PreviewPaneId;
    theme: ChartsTheme;
    /** Whether the palette has strokes for an outline to be drawn in. */
    strokesEnabled: boolean;
}

/**
 * One of the two preview charts, with the controls deciding what it shows. The
 * controls sit above the chart's box because they are the tool's own chrome:
 * inside it they kept the site's colours on the preset's background, putting
 * dark pills on a white surface for a light theme in dark mode.
 */
export const PreviewPane = ({ pane, theme, strokesEnabled }: Props) => {
    const [chartType, setChartType] = usePreviewChartType(pane);
    const [seriesCount, setSeriesCount] = usePreviewSeriesCount(pane);
    const [features, setFeatures] = usePreviewFeatures(pane);
    const setEditedGroup = useSetEditedGroup();

    // With the palette's strokes off an outline would be drawn in the fill's own
    // colour, so the feature is withheld rather than left doing nothing. What the
    // pane chose stays in storage and comes back with the strokes.
    const availableFeatures = strokesEnabled
        ? chartType.features
        : chartType.features.filter((id) => id !== 'seriesStrokes');
    // Memoised: the chart rebuilds its options on an identity change, so a fresh
    // object each render would restart the animation on any parent render.
    const activeFeatures = useMemo(
        () => (strokesEnabled ? features : { ...features, seriesStrokes: false }),
        [strokesEnabled, features]
    );

    return (
        // Reaching for the preview releases any tooltip the panel holds open
        // here: a held tooltip is frozen, so it would otherwise leave the user
        // unable to hover their own chart.
        <Pane onPointerDownCapture={() => setEditedGroup(null)}>
            <Toolbar>
                <PreviewOptions
                    paneLabel={PREVIEW_PANE_LABELS[pane]}
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                    seriesCount={seriesCount}
                    onSeriesCountChange={setSeriesCount}
                    features={features}
                    availableFeatures={availableFeatures}
                    onFeaturesChange={setFeatures}
                />
            </Toolbar>
            <Chart>
                {/* Keyed on the factory, not the type: a preset is fixed at
                    creation, so moving in or out of one has to remount. */}
                <ChartPreview
                    key={chartType.preset ?? 'plain'}
                    theme={theme}
                    chartType={chartType}
                    seriesCount={seriesCount}
                    features={activeFeatures}
                />
            </Chart>
        </Pane>
    );
};

const Pane = styled('div')`
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

// Flush with the left edge of the chart below, so each pair reads as one column.
const Toolbar = styled('div')`
    flex-shrink: 0;
    display: flex;
`;

const Chart = styled('div')`
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md, 8px);
    background: var(--color-bg-primary);
`;
