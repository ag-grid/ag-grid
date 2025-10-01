import type { AgChartThemeOverrides } from 'ag-charts-community';

const defaultChartThemes = ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];
const defaultChartThemesDark = defaultChartThemes.map((theme) => theme + '-dark');

export function getDefaultChartThemes(isDarkMode: boolean): string[] {
    return isDarkMode ? defaultChartThemesDark : defaultChartThemes;
}

const axisLabelFormatter = ({ value }) => {
    if (isNaN(value)) {
        return value;
    }

    const absolute = Math.abs(value);
    let standardised = '';

    if (absolute < 1e3) {
        standardised = absolute.toString();
    }
    if (absolute >= 1e3 && absolute < 1e6) {
        standardised = '$' + +(absolute / 1e3).toFixed(1) + 'K';
    }
    if (absolute >= 1e6 && absolute < 1e9) {
        standardised = '$' + +(absolute / 1e6).toFixed(1) + 'M';
    }
    if (absolute >= 1e9 && absolute < 1e12) {
        standardised = '$' + +(absolute / 1e9).toFixed(1) + 'B';
    }
    if (absolute >= 1e12) standardised = '$' + +(absolute / 1e12).toFixed(1) + 'T';

    return `${value < 0 ? '-' + standardised : standardised}`;
};

const hierarchicalSeriesThemeOverrides = {
    gradientLegend: {
        scale: {
            label: {
                formatter: ({ value }: { value: any }) => {
                    const num = Number(value);
                    return isNaN(num) ? value : '$' + num.toLocaleString();
                },
            },
        },
    },
};

export const chartThemeOverrides: AgChartThemeOverrides = {
    common: {
        axes: {
            number: {
                label: {
                    formatter: axisLabelFormatter,
                },
            },
            'angle-number': {
                label: {
                    formatter: axisLabelFormatter,
                },
            },
            'radius-number': {
                label: {
                    formatter: axisLabelFormatter,
                },
            },
        },
    },
    treemap: hierarchicalSeriesThemeOverrides,
    sunburst: hierarchicalSeriesThemeOverrides,
};
