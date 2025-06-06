import type { _RowHighlightGridApi } from '../api/gridApi';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { getHighlightedRow, setHighlightedRow } from './rowHighlightApi';
import { RowHighlightService } from './rowHighlightService';

export const SharedRowHighlightModule: _ModuleWithoutApi = {
    moduleName: 'SharedRowSelection',
    version: VERSION,
    beans: [RowHighlightService],
};

export const RowHighlightModule: _ModuleWithApi<_RowHighlightGridApi> = {
    moduleName: 'RowHighlight',
    version: VERSION,
    dependsOn: [SharedRowHighlightModule],
    apiFunctions: {
        getHighlightedRow,
        setHighlightedRow,
    },
};
