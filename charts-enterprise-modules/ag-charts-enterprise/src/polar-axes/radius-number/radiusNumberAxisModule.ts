import type { _ModuleSupport } from 'ag-charts-community';
import { _Scale } from 'ag-charts-community';
import { RadiusNumberAxis } from './radiusNumberAxis';
import { RADIUS_NUMBER_AXIS_THEME } from './radiusNumberAxisThemes';

export const RadiusNumberAxisModule: _ModuleSupport.AxisModule = {
    type: 'axis',
    optionsKey: 'axes[]',

    packageType: 'enterprise',
    chartTypes: ['polar'],

    identifier: 'radius-number',
    instanceConstructor: RadiusNumberAxis,
    themeTemplate: RADIUS_NUMBER_AXIS_THEME,
};
