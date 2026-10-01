import type { _AggregationGridApi, _ModuleWithApi, _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { AggColumnNameService } from './aggColumnNameService';
import { AggFuncService } from './aggFuncService';
import { AggregatedChildrenSvc } from './aggregatedChildrenSvc';
import { addAggFuncs, clearAggFuncs, setColumnAggFunc } from './aggregationApi';
import { AggregationStage } from './aggregationStage';
import { FilterAggregatesStage } from './filterAggregatesStage';
import { FooterService } from './footerService';
import { ValueColsSvc } from './valueColsSvc';

/**
 * @internal
 */
export const SharedAggregationModule: _ModuleWithApi<_AggregationGridApi<any>> = {
    moduleName: 'SharedAggregation',
    version: VERSION,
    beans: [AggFuncService, AggColumnNameService, FooterService, ValueColsSvc],
    apiFunctions: {
        addAggFuncs,
        clearAggFuncs,
        setColumnAggFunc,
    },
    dependsOn: [EnterpriseCoreModule],
};

/**
 * The pipeline stage that writes aggData, on its own so a feature that only reads it does not pull in
 * the filtering and children services with it.
 * @internal
 */
export const AggregationStageModule: _ModuleWithoutApi = {
    moduleName: 'AggregationStage',
    version: VERSION,
    beans: [AggregationStage],
    rowModels: ['clientSide'],
    dependsOn: [SharedAggregationModule],
};

/**
 * @internal
 */
export const AggregationModule: _ModuleWithoutApi = {
    moduleName: 'Aggregation',
    version: VERSION,
    beans: [FilterAggregatesStage, AggregatedChildrenSvc],
    rowModels: ['clientSide'],
    dependsOn: [AggregationStageModule],
};
