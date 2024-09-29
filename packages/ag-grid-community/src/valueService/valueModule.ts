import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { ExpressionService } from './expressionService';
import { ValueCache } from './valueCache';

export const ValueCacheModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/value-cache',
    beans: [ValueCache],
});

export const ExpressionModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/expression',
    beans: [ExpressionService],
});
