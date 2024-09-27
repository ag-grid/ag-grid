import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { AlignedGridsService } from './alignedGridsService';

export const AlignedGridsModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/aligned-grid',
    beans: [AlignedGridsService],
});
