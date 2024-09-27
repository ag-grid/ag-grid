import type { _ColumnHoverApi } from '../../api/gridApi';
import { defineCommunityModule } from '../../interfaces/iModule';
import { isColumnHovered } from './columnHoverApi';
import { ColumnHoverService } from './columnHoverService';

export const ColumnHoverModule = defineCommunityModule<_ColumnHoverApi>('@ag-grid-community/column-hover', {
    beans: [ColumnHoverService],
    apiFunctions: {
        isColumnHovered,
    },
});
