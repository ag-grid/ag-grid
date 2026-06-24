import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { PageNumbersComp } from './pageNumbersComp';
import { PaginationModule } from './paginationModule';

/**
 * @feature Rows -> Row Pagination
 * @gridOption paginationPanels
 */
export const PageNumbersModule: _ModuleWithoutApi = {
    moduleName: 'PageNumbers',
    version: VERSION,
    dynamicBeans: { pageNumbers: PageNumbersComp },
    dependsOn: [PaginationModule],
};
