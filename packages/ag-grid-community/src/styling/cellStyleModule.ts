import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { StylingService } from './stylingService';

export const CellStyleModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/cell-style',
    beans: [StylingService],
});
