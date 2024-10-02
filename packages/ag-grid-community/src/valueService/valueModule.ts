import type { _ValueApi, _ValueCacheApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
import { expireValueCache, getCellValue } from './cellApi';
import { ChangeDetectionService } from './changeDetectionService';
import { ExpressionService } from './expressionService';
import { ValueCache } from './valueCache';

export const ValueCacheModule: ModuleWithApi<_ValueCacheApi> = {
    ...baseCommunityModule('ValueCacheModule'),
    beans: [ValueCache],
    apiFunctions: {
        expireValueCache,
    },
};

export const ExpressionModule: Module = {
    ...baseCommunityModule('ExpressionModule'),
    beans: [ExpressionService],
};

export const ChangeDetectionModule: Module = {
    ...baseCommunityModule('ChangeDetectionModule'),
    beans: [ChangeDetectionService],
};

export const CellApiModule: ModuleWithApi<_ValueApi<any>> = {
    ...baseCommunityModule('CellApiModule'),
    apiFunctions: {
        getCellValue,
    },
};
