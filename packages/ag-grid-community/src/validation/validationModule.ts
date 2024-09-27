import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { ValidationService } from './validationService';

export const ValidationModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/core-validation',
    beans: [ValidationService],
});
