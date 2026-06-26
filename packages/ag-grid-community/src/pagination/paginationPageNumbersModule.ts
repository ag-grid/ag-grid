import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { PageNumbersComp } from './pageNumbersComp';
import { PaginationModule } from './paginationModule';

/**
 * Enables the `pageNumbers` pagination panel: numbered page buttons for direct
 * navigation, with ellipses for large page counts (e.g. `1 … 9 10 11 … 51`).
 * Opt-in via the `paginationPanels` grid option; not included in the default panels.
 *
 * @see https://www.ag-grid.com/javascript-data-grid/row-pagination/#pagination-panel-layout
 * @feature Rows -> Row Pagination
 * @gridOption paginationPanels
 */
export const PaginationPageNumbersModule: _ModuleWithoutApi = {
    moduleName: 'PaginationPageNumbers',
    version: VERSION,
    dynamicBeans: { pageNumbers: PageNumbersComp as any },
    dependsOn: [PaginationModule],
};
