import type { _ModuleWithoutApi } from 'ag-grid-community';

import { VERSION } from '../version';
import { formulaStylesCSS } from './formula-styles.css-GENERATED';
import { FormulaService } from './formulaService';
import { CellSelectionModule } from '../rangeSelection/rangeSelectionModule';
import { RowNumbersModule } from '../rowNumbers/rowNumbersModule';

/**
 * @feature FormulaModule
 */
export const FormulaModule: _ModuleWithoutApi = {
    moduleName: 'Formula',
    version: VERSION,
    beans: [FormulaService],
    dependsOn: [CellSelectionModule, RowNumbersModule],
    css: [formulaStylesCSS],
};
