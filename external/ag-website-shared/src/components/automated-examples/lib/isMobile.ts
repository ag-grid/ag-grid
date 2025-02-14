import breakpoints from '@design-system/breakpoint.module.scss';

const AUTOMATED_ROW_GROUPING_MEDIUM_WIDTH = parseInt(breakpoints['automated-row-grouping-medium'], 10);
const AUTOMATED_INTEGRATED_CHARTS_MEDIUM_WIDTH = parseInt(breakpoints['automated-integrated-charts-medium'], 10);

type ExampleType = 'rowGrouping' | 'integratedCharts';

export const isMobile = (type: ExampleType) => {
    const maxWidth =
        type === 'rowGrouping' ? AUTOMATED_ROW_GROUPING_MEDIUM_WIDTH : AUTOMATED_INTEGRATED_CHARTS_MEDIUM_WIDTH;
    return window.innerWidth <= maxWidth;
};
