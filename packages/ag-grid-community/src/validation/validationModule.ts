import { defineCommunityModule } from '../interfaces/iModule';
import { ValidationService } from './validationService';

export const ValidationModule = defineCommunityModule('ValidationModule', {
    beans: [ValidationService],
});
