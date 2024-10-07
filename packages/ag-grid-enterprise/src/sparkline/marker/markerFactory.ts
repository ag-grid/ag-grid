import type { _Scene } from 'ag-charts-community';

import { ChartWrapper } from '../../charts/chartWrapper';

export function getMarker(shape: string): typeof _Scene.Circle | typeof _Scene.Square | typeof _Scene.Diamond {
    switch (shape) {
        case 'circle':
            return ChartWrapper._Scene.Circle;
        case 'square':
            return ChartWrapper._Scene.Square;
        case 'diamond':
            return ChartWrapper._Scene.Diamond;
        default:
            return ChartWrapper._Scene.Circle;
    }
}
