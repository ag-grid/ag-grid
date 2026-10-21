import type { AgChartThemePalette, IntegratedModule } from 'ag-charts-types';

/**
 * The subset of the AG Charts Integrated module that the grid uses. `_Theme` is only needed to resolve a theme to its
 * palette, until AG Charts exposes that as plain data (AG-18821).
 */
export interface IAgChartsExports {
    readonly beanName: 'agChartsExports';
    isEnterprise: boolean;
    create: IntegratedModule['create'];
    _Theme: {
        getChartTheme(value: unknown): { palette: AgChartThemePalette };
    };
}
