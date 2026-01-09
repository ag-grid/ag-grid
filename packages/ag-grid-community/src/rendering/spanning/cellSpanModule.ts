import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { RowSpanService } from './rowSpanService';
import { SpannedRowRenderer } from './spannedRowRenderer';

/**
 * @feature Spanning -> Cell Spanning
 * @colDef colDef.rowSpan, colDef.colSpan
 */
export const CellSpanModule: _ModuleWithoutApi = {
    moduleName: 'CellSpan',
    version: VERSION,
    beans: [RowSpanService, SpannedRowRenderer],
};
