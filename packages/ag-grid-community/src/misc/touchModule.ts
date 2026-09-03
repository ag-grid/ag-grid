import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { TouchGesturesService } from './touchGesturesService';
import { TouchService } from './touchService';

/**
 * @feature Interactivity -> Touch
 */
export const TouchModule: _ModuleWithoutApi = {
    moduleName: 'Touch',
    version: VERSION,
    beans: [TouchGesturesService, TouchService],
};
