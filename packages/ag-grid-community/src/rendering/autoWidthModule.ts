import { defineCommunityModule } from '../interfaces/iModule';
import { AutoWidthCalculator } from './autoWidthCalculator';

export const AutoWidthModule = defineCommunityModule('AutoWidthModule', {
    beans: [AutoWidthCalculator],
});
