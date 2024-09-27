import type { _ColumnHoverApi } from '../../api/gridApi';
import { defineCommunityModule } from '../../interfaces/iModule';
import { isColumnHovered } from './columnHoverApi';
import { ColumnHoverService } from './columnHoverService';

export const ColumnHoverModule = defineCommunityModule<_ColumnHoverApi>('ColumnHoverModule', {
    beans: [ColumnHoverService],
    apiFunctions: {
        isColumnHovered,
    },
});
