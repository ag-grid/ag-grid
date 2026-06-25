import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { PageNumbersComp } from './pageNumbersComp';
import { PaginationModule } from './paginationModule';

/**
 * @feature Rows -> Row Pagination
 * @gridOption paginationPanels
 */
export const PaginationPageNumbersModule: _ModuleWithoutApi = {
    moduleName: 'PaginationPageNumbers',
    version: VERSION,
    dynamicBeans: { pageNumbers: PageNumbersComp as any },
    dependsOn: [PaginationModule],
};
