import type { _ColumnResizeApi } from '../api/gridApi';
import { HorizontalResizeModule } from '../dragAndDrop/dragModule';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { setColumnWidth, setColumnWidths } from './columnResizeApi';
import { ColumnResizeService } from './columnResizeService';

export const ColumnResizeCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/column-resize-core',
    beans: [ColumnResizeService],
    dependantModules: [HorizontalResizeModule],
});

export const ColumnResizeApiModule = _defineModule<_ColumnResizeApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/column-resize-api',
    apiFunctions: {
        setColumnWidth,
        setColumnWidths,
    },
    dependantModules: [ColumnResizeCoreModule],
});

export const ColumnResizeModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/column-resize',
    dependantModules: [ColumnResizeApiModule],
});
