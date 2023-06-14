import { _ModuleSupport, _Scale } from 'ag-charts-community';
import { AngleCategoryAxis } from './angleCategoryAxis';

export const AngleCategoryAxisModule: _ModuleSupport.AxisModule = {
    type: 'axis',
    optionsKey: 'axes[]',

    packageType: 'enterprise',
    chartTypes: ['polar'],

    identifier: 'polar-angle-category',
    instanceConstructor: AngleCategoryAxis,
    themeTemplate: {},
};
