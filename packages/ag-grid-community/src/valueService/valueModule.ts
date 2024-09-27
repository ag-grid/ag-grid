import type { _ValueApi, _ValueCacheApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import { expireValueCache, getCellValue } from './cellApi';
import { ChangeDetectionService } from './changeDetectionService';
import { ExpressionService } from './expressionService';
import { ValueCache } from './valueCache';

export const ValueCacheModule = defineCommunityModule<_ValueCacheApi>('@ag-grid-community/value-cache', {
    beans: [ValueCache],
    apiFunctions: {
        expireValueCache,
    },
});

export const ExpressionModule = defineCommunityModule('@ag-grid-community/expression', {
    beans: [ExpressionService],
});

export const ChangeDetectionModule = defineCommunityModule('@ag-grid-community/change-detection', {
    beans: [ChangeDetectionService],
});

export const CellApiModule = defineCommunityModule<_ValueApi>('@ag-grid-community/cell-api', {
    apiFunctions: {
        getCellValue,
    },
});
