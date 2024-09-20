import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { ValueCache } from './valueCache';

export const ValueCacheModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/value-cache',
    beans: [ValueCache],
});
