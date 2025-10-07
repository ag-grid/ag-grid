import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { formulaStylesCSS } from './formula-styles.css-GENERATED';
import { FormulaService } from './formulaService';

/**
 *
 */
export const FormulaModule: _ModuleWithoutApi = {
    moduleName: 'Formula',
    version: VERSION,
    beans: [FormulaService],
    css: [formulaStylesCSS],
};
