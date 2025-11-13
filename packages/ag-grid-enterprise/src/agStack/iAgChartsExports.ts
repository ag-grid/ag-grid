import type { IntegratedModule } from 'ag-charts-types';

/** MAKE SURE TO UPDATE THE SCRIPT scripts/ci/substituteAgChartsTypesScene.sh WHEN CHANGING THIS FILE */
type ChartTypes = IntegratedModule;

export interface IAgChartsExports {
    readonly beanName: 'agChartsExports';
    isEnterprise: boolean;
    create: ChartTypes['create'];
    _Theme: ChartTypes['_Theme'];
    _Scene: ChartTypes['_Scene'];
    _Util: ChartTypes['_Util'];
}
