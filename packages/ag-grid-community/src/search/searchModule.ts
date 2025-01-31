import type { _SearchApi } from '../api/gridApi';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { searchCSS } from './search.css-GENERATED';
import {
    searchGetActiveMatch,
    searchGetActiveMatchNum,
    searchGetTotalMatches,
    searchGoTo,
    searchNext,
    searchPrevious,
} from './searchApi';
import { SearchCellRenderer } from './searchCellRenderer';
import { SearchService } from './searchService';

/**
 * @internal
 */
const SearchCoreModule: _ModuleWithoutApi = {
    moduleName: 'SearchCore',
    version: VERSION,
    rowModels: ['clientSide'],
    beans: [SearchService],
    userComponents: {
        agSearchCellRenderer: SearchCellRenderer,
    },
    css: [searchCSS],
};

/**
 * @feature Filtering -> Quick Filter
 * @gridOption SearchText
 */
export const SearchModule: _ModuleWithApi<_SearchApi> = {
    moduleName: 'Search',
    version: VERSION,
    apiFunctions: {
        searchGetTotalMatches,
        searchGoTo,
        searchNext,
        searchPrevious,
        searchGetActiveMatch,
        searchGetActiveMatchNum,
    },
    dependsOn: [SearchCoreModule],
};
