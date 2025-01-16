import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { RowSpanService } from './rowSpanService';
import { SpannedCellRenderer } from './spannedCellRenderer';

export const CellSpanModule: _ModuleWithoutApi = {
    moduleName: 'CellSpan',
    version: VERSION,
    beans: [RowSpanService, SpannedCellRenderer],
};
