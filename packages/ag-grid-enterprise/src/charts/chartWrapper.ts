import type { AgCharts, _ModuleSupport, _Scale, _Scene, _Theme, _Util, time } from 'ag-charts-community';

import type { NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export type ChartWrapperParams = {
    VERSION: string;
    _ModuleSupport: typeof _ModuleSupport;
    _Scale: typeof _Scale;
    _Scene: typeof _Scene;
    _Theme: typeof _Theme;
    _Util: typeof _Util;
    time: typeof time;
    AgCharts: typeof AgCharts;
    setupModules: () => void;
};

export class ChartWrapper extends BeanStub implements NamedBean {
    beanName = 'chartWrapper' as const;

    public static CHARTS_VERSION: string;
    public static _ModuleSupport: typeof _ModuleSupport;
    public static _Scale: typeof _Scale;
    public static _Scene: typeof _Scene;
    public static _Theme: typeof _Theme;
    public static _Util: typeof _Util;
    public static time: typeof time;
    public static AgCharts: typeof AgCharts;

    static setup(params: ChartWrapperParams) {
        console.log('params: chartWrapper', params);
        ChartWrapper.CHARTS_VERSION = params.VERSION;
        ChartWrapper._ModuleSupport = params._ModuleSupport;
        ChartWrapper._Scale = params._Scale;
        ChartWrapper._Scene = params._Scene;
        ChartWrapper._Theme = params._Theme;
        ChartWrapper._Util = params._Util;
        ChartWrapper.time = params.time;
        ChartWrapper.AgCharts = params.AgCharts;
    }

    get ModuleSupport() {
        return ChartWrapper._ModuleSupport;
    }
}
