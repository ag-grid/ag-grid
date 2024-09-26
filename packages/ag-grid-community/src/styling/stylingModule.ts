import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { CellStyleService } from './cellStyleService';
import { RowStyleService } from './rowStyleService';

export const CellStyleModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/cell-style',
    beans: [CellStyleService],
});

export const RowStyleModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/row-style',
    beans: [RowStyleService],
});
