import { _ModuleSupport, _Scale } from 'ag-charts-community';
import { RadiusCrossLine } from './radiusCrossLine';
import { RadiusNumberAxis } from './radiusNumberAxis';
import { RADIUS_NUMBER_AXIS_THEME } from './radiusNumberAxisThemes';

export const RadiusNumberAxisModule: _ModuleSupport.AxisModule = {
    type: 'axis',
    optionsKey: 'axes[]',

    packageType: 'enterprise',
    chartTypes: ['polar'],

    identifier: 'radius-number',
    instanceConstructor: RadiusNumberAxis,
    optionConstructors: {
        'axes[].crossLines[]': RadiusCrossLine,
    },
    themeTemplate: RADIUS_NUMBER_AXIS_THEME,
};
