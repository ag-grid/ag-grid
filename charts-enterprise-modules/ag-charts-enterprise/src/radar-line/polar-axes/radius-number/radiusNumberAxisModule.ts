import { _ModuleSupport, _Scale } from 'ag-charts-community';
import { RadiusNumberAxis } from './radiusNumberAxis';

export const RadiusNumberAxisModule: _ModuleSupport.AxisModule = {
    type: 'axis',
    optionsKey: 'axes[]',

    packageType: 'enterprise',
    chartTypes: ['polar'],

    identifier: 'polar-radius-number',
    instanceConstructor: RadiusNumberAxis,
    themeTemplate: {},
};
