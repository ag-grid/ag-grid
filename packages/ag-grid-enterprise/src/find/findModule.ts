import type { _FindApi, _ModuleWithApi, _ModuleWithoutApi } from 'ag-grid-community';

import { VERSION } from '../version';
import { findCSS } from './find.css-GENERATED';
import {
    findGetActiveMatch,
    findGetNumMatches,
    findGetParts,
    findGetTotalMatches,
    findGoTo,
    findNext,
    findPrevious,
} from './findApi';
import { FindCellRenderer } from './findCellRenderer';
import { FindService } from './findService';

/**
 * @internal
 */
const FindCoreModule: _ModuleWithoutApi = {
    moduleName: 'FindCore',
    version: VERSION,
    rowModels: ['clientSide'],
    beans: [FindService],
    userComponents: {
        agFindCellRenderer: FindCellRenderer,
    },
    css: [findCSS],
};

/**
 * @feature Find
 * @gridOption findText
 */
export const FindModule: _ModuleWithApi<_FindApi> = {
    moduleName: 'Find',
    version: VERSION,
    apiFunctions: {
        findGetTotalMatches,
        findGoTo,
        findNext,
        findPrevious,
        findGetActiveMatch,
        findGetNumMatches,
        findGetParts,
    },
    dependsOn: [FindCoreModule],
};
