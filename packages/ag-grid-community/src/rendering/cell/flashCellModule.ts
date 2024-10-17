import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { baseCommunityModule } from '../../interfaces/iModule';
import { FlashCellService } from './flashCellService';

export const FlashCellModule: _ModuleWithoutApi = {
    ...baseCommunityModule('FlashCellModule'),
    beans: [FlashCellService],
};
