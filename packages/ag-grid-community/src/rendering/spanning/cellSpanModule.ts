import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { RowSpanService } from './rowSpanService';
import { SpannedRowRenderer } from './spannedRowRenderer';

/**
 * @feature Spanning -> Cell Spanning
 * @gridOption enableCellSpan
 * @colDef spanRows
 */
export const CellSpanModule: _ModuleWithoutApi = {
    moduleName: 'CellSpan',
    version: VERSION,
    beans: [RowSpanService, SpannedRowRenderer],
};
