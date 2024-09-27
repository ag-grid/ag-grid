import type { _ValueApi, _ValueCacheApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { expireValueCache, getCellValue, getValue } from './cellApi';
import { ChangeDetectionService } from './changeDetectionService';
import { ExpressionService } from './expressionService';
import { ValueCache } from './valueCache';

export const ValueCacheModule = _defineModule<_ValueCacheApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/value-cache',
    beans: [ValueCache],
    apiFunctions: {
        expireValueCache,
    },
});

export const ExpressionModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/expression',
    beans: [ExpressionService],
});

export const ChangeDetectionModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/change-detection',
    beans: [ChangeDetectionService],
});

export const CellApiModule = _defineModule<_ValueApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/cell-api',
    apiFunctions: {
        getValue,
        getCellValue,
    },
});
