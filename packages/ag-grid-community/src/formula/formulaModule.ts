import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { FormulaService } from './formulaService';

/**
 *
 */
export const FormulaModule: _ModuleWithoutApi = {
    moduleName: 'Formula',
    version: VERSION,
    beans: [FormulaService],
};
