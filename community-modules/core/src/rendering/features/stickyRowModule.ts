import { _defineModule } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { StickyRowService } from './stickyRowService';

export const StickyRowModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/sticky-row',
    beans: [StickyRowService],
});
