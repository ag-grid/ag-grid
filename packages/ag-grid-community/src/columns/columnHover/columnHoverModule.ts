import type { _ColumnHoverApi } from '../../api/gridApi';
import { _defineModule } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { isColumnHovered } from './columnHoverApi';
import { ColumnHoverService } from './columnHoverService';

export const ColumnHoverModule = _defineModule<_ColumnHoverApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/column-hover',
    beans: [ColumnHoverService],
    apiFunctions: {
        isColumnHovered,
    },
});
