import styled from '@emotion/styled';
import type { AgChartOptions } from 'ag-charts-community';
import { memo, useLayoutEffect, useMemo } from 'react';

import { THUMBNAIL_OPTIONS } from './chartTypes';
import { toChartTheme } from './chartsThemeOutput';
import type { ChartsPreset } from './presets';
import { useChart } from './useChart';

interface Props {
    preset: ChartsPreset;
}

/**
 * A theme thumbnail: a whole chart at card size, themed through the same path as
 * the main preview so a card cannot show something the tool would not produce.
 * Rendered whole rather than cropped like grid's - a cropped chart loses its
 * frame and reads as disconnected blocks of colour.
 */
export const PresetPreview = memo(({ preset }: Props) => {
    const options = useMemo<AgChartOptions>(() => {
        const theme = toChartTheme({ baseTheme: preset.baseTheme, params: preset.params, palette: preset.palette });
        return {
            ...THUMBNAIL_OPTIONS,
            // Pinned because the presets choose their own, and a card laid out
            // differently from its neighbours stops reading as a comparable swatch.
            theme: { ...theme, params: { ...theme.params, chartPadding: 6 } },
        };
    }, [preset]);
    const containerRef = useChart(options);

    useLayoutEffect(() => {
        // Thumbnails are decoration: keep them out of the tab order and off the
        // accessibility tree, the way grid's do.
        containerRef.current?.setAttribute('inert', '');
    }, [containerRef]);

    return (
        <Card className="preset-preview">
            <ChartContainer ref={containerRef} />
        </Card>
    );
});

const Card = styled('div')`
    width: 248px;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    cursor: pointer;

    background-color: color-mix(in srgb, var(--color-bg-primary), var(--color-fg-primary) 3%);
    border: solid 1px color-mix(in srgb, var(--color-bg-primary), var(--color-fg-primary) 7%);

    transition:
        background-color 0.25s,
        border-color 0.25s;

    &:hover {
        border-color: color-mix(in srgb, var(--color-bg-primary), var(--color-fg-primary) 10%);
        background-color: color-mix(in srgb, var(--color-bg-primary), var(--color-fg-primary) 6%);
    }
`;

// Inset rather than bled, the way a real chart sits in a real page.
const ChartContainer = styled('div')`
    position: absolute;
    inset: 10px;
    pointer-events: none;

    transition: transform 0.25s;

    .preset-preview:hover & {
        transform: scale(1.03);
    }
`;
