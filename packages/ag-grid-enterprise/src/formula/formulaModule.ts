import type { _FormulaGridApi, _ModuleWithApi } from 'ag-grid-community';

import { RowNumbersModule } from '../rowNumbers/rowNumbersModule';
import { VERSION } from '../version';
import { FormulaCellEditor } from './editor/formulaCellEditor';
import formulaCSS from './formula.css';
import { refreshFormulas } from './formulaApi';
import { FormulaDataService } from './formulaDataService';
import { FormulaInputManagerService } from './formulaInputManagerService';
import { FormulaService } from './formulaService';

/**
 * @feature Formulas
 */
export const FormulaModule: _ModuleWithApi<_FormulaGridApi<any>> = {
    moduleName: 'Formula',
    version: VERSION,
    userComponents: { agFormulaCellEditor: FormulaCellEditor },
    beans: [FormulaService, FormulaDataService, FormulaInputManagerService],
    apiFunctions: {
        refreshFormulas,
    },
    dependsOn: [RowNumbersModule],
    css: [formulaCSS],
};
