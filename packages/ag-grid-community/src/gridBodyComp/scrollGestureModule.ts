import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { ScrollGestureFeature } from './scrollGestureFeature';

/**
 * @feature Scrolling -> Scroll Gestures
 * @gridOption scrollGestureMode
 */
export const ScrollGestureModule: _ModuleWithoutApi = {
    moduleName: 'ScrollGesture',
    version: VERSION,
    dynamicBeans: { scrollGestureFeature: ScrollGestureFeature },
};
