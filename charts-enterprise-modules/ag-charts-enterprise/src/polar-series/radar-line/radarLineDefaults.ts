import { AgPolarChartOptions } from 'ag-charts-community';
import { AngleCategoryAxis } from '../../polar-axes/angle-category/angleCategoryAxis';
import { RadiusNumberAxis } from '../../polar-axes/radius-number/radiusNumberAxis';

export const RADAR_LINE_DEFAULTS: AgPolarChartOptions = {
    axes: [
        {
            type: AngleCategoryAxis.type,
        },
        {
            type: RadiusNumberAxis.type,
        },
    ],
};
