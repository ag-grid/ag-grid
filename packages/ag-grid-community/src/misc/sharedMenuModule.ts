import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { MenuService } from './menuService';

export const SharedMenuModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/shared-menu',
    beans: [MenuService],
});
