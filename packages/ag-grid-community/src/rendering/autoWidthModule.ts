import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { AutoWidthCalculator } from './autoWidthCalculator';

export const AutoWidthModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/auto-width',
    beans: [AutoWidthCalculator],
});
