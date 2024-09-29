import { _defineModule } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { AgComponentUtils } from './agComponentUtils';

export const CellRendererFunctionModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/cell-renderer-function',
    beans: [AgComponentUtils],
});
