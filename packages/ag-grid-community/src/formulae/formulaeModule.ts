import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { FormulaeService } from './formulaeService';

/**
 *
 */
export const FormulaeModule: _ModuleWithoutApi = {
    moduleName: 'Formulae',
    version: VERSION,
    beans: [FormulaeService],
};
