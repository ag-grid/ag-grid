import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { AnimationFrameService } from './animationFrameService';

export const AnimationFrameModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/animation-frame',
    beans: [AnimationFrameService],
});
