import type { _ModuleSupport } from 'ag-charts-community';
import { _Scale } from 'ag-charts-community';
import { AngleCategoryAxis } from './angleCategoryAxis';
import { ANGLE_CATEGORY_AXIS_THEME } from './angleCategoryAxisThemes';

export const AngleCategoryAxisModule: _ModuleSupport.AxisModule = {
    type: 'axis',
    optionsKey: 'axes[]',

    packageType: 'enterprise',
    chartTypes: ['polar'],

    identifier: 'angle-category',
    instanceConstructor: AngleCategoryAxis,
    themeTemplate: ANGLE_CATEGORY_AXIS_THEME,
};
