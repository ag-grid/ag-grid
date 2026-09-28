import styled from '@emotion/styled';
import { useMemo } from 'react';

import type { ChartFeatures } from './chartFeatures';
import type { PreviewChartOptions, PreviewChartType } from './chartTypes';
import type { ChartsTheme } from './chartsThemeOutput';
import { useEditedGroup } from './editedGroup';
import { TOOLTIPS_GROUP_ID } from './params';
import { useChart } from './useChart';

interface Props {
    theme: ChartsTheme;
    chartType: PreviewChartType;
    seriesCount: number;
    features: ChartFeatures;
}

export const ChartPreview = ({ theme, chartType, seriesCount, features }: Props) => {
    const editedGroup = useEditedGroup();
    const options = useMemo<PreviewChartOptions>(
        () => ({ ...chartType.buildOptions(seriesCount, features), theme }),
        [chartType, seriesCount, features, theme]
    );
    // The tooltip params change something a chart only draws on hover, so while
    // they are being edited the chart is asked to hold one open. Not every type
    // can be asked - see `PreviewChartType.tooltipTarget`.
    const tooltipTarget = editedGroup === TOOLTIPS_GROUP_ID ? chartType.tooltipTarget : undefined;
    return <Container ref={useChart(options, chartType.preset, tooltipTarget)} />;
};

const Container = styled('div')`
    flex: 1;
    min-height: 0;
    width: 100%;
`;
