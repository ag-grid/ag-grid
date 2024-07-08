import { AlignedGridsService } from './alignedGridsService';
import { _defineModule } from './interfaces/iModule';
import { VERSION } from './version';

export const AlignedGridsModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/aligned-grid',
    beans: [AlignedGridsService],
});
