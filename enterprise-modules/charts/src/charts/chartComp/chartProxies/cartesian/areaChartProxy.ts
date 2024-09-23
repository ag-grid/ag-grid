import type { ChartProxyParams } from '../chartProxy';
import { LineChartProxy } from './lineChartProxy';

export class AreaChartProxy extends LineChartProxy<'area'> {
    public constructor(params: ChartProxyParams) {
        super(params);
    }
}
