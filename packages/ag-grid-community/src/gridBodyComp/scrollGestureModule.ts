import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { ScrollGestureService } from './scrollGestureService';

/**
 * @feature Scrolling -> Scroll Gestures
 * @gridOption scrollGestureMode
 */
export const ScrollGestureModule: _ModuleWithoutApi = {
    moduleName: 'ScrollGesture',
    version: VERSION,
    beans: [ScrollGestureService],
};
