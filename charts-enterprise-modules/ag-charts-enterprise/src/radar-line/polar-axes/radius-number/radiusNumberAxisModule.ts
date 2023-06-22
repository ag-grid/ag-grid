import { _ModuleSupport, _Scale } from 'ag-charts-community';
import { RadiusNumberAxis } from './radiusNumberAxis';
import { RADIUS_NUMBER_AXIS_THEME } from './radiusNumberAxisThemes';

export const RadiusNumberAxisModule: _ModuleSupport.AxisModule = {
    type: 'axis',
    optionsKey: 'axes[]',

    packageType: 'enterprise',
    chartTypes: ['polar'],

    identifier: 'polar-radius-number',
    instanceConstructor: RadiusNumberAxis,
    themeTemplate: RADIUS_NUMBER_AXIS_THEME,
};
