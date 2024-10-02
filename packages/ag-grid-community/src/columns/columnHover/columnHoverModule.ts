import type { _ColumnHoverApi } from '../../api/gridApi';
import type { ModuleWithApi } from '../../interfaces/iModule';
import { baseCommunityModule } from '../../interfaces/iModule';
import { isColumnHovered } from './columnHoverApi';
import { ColumnHoverService } from './columnHoverService';

export const ColumnHoverModule: ModuleWithApi<_ColumnHoverApi> = {
    ...baseCommunityModule('ColumnHoverModule'),
    beans: [ColumnHoverService],
    apiFunctions: {
        isColumnHovered,
    },
};
