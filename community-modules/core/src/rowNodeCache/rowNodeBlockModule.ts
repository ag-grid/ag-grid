import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { RowNodeBlockLoader } from './rowNodeBlockLoader';

export const RowNodeBlockModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/row-node-block',
    beans: [RowNodeBlockLoader],
});
