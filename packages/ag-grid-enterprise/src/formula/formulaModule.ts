import type { _ModuleWithoutApi } from 'ag-grid-community';

import { RowNumbersModule } from '../rowNumbers/rowNumbersModule';
import { VERSION } from '../version';
import { formulaStylesCSS } from './formula-styles.css-GENERATED';
import { FormulaDataService } from './formulaDataService';
import { FormulaService } from './formulaService';

/**
 * @feature FormulaModule
 */
export const FormulaModule: _ModuleWithoutApi = {
    moduleName: 'Formula',
    version: VERSION,
    beans: [FormulaService, FormulaDataService],
    dependsOn: [RowNumbersModule],
    css: [formulaStylesCSS],
};
