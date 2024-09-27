import { defineCommunityModule } from '../interfaces/iModule';
import { AutoWidthCalculator } from './autoWidthCalculator';

export const AutoWidthModule = defineCommunityModule('@ag-grid-community/auto-width', {
    beans: [AutoWidthCalculator],
});
