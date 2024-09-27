import type { _ValueApi, _ValueCacheApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import { expireValueCache, getCellValue } from './cellApi';
import { ChangeDetectionService } from './changeDetectionService';
import { ExpressionService } from './expressionService';
import { ValueCache } from './valueCache';

export const ValueCacheModule = defineCommunityModule<_ValueCacheApi>('ValueCacheModule', {
    beans: [ValueCache],
    apiFunctions: {
        expireValueCache,
    },
});

export const ExpressionModule = defineCommunityModule('ExpressionModule', {
    beans: [ExpressionService],
});

export const ChangeDetectionModule = defineCommunityModule('ChangeDetectionModule', {
    beans: [ChangeDetectionService],
});

export const CellApiModule = defineCommunityModule<_ValueApi>('CellApiModule', {
    apiFunctions: {
        getCellValue,
    },
});
