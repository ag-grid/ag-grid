import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import errorOverlayCSS from './errorOverlay.css';
import { ValidationService } from './validationService';

/**
 * @feature Validation
 */
export const ValidationModule: _ModuleWithoutApi = {
    moduleName: 'Validation',
    version: VERSION,
    beans: [ValidationService],
    css: [errorOverlayCSS],
};
