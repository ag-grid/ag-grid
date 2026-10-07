import type { _ModuleWithoutApi } from 'ag-grid-community';

import { VERSION } from '../version';
import grandTotalRowStylesCSS from './grandTotalRowStyles.css';
import { GrandTotalRowStylesService } from './grandTotalRowStylesService';

/**
 * Styles the grand total row, e.g. the `grandTotalRowBorder` theme param.
 * @internal
 */
export const GrandTotalRowStylesModule: _ModuleWithoutApi = {
    moduleName: 'GrandTotalRowStyles',
    version: VERSION,
    beans: [GrandTotalRowStylesService],
    css: [grandTotalRowStylesCSS],
};
