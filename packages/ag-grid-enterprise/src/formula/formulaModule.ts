import type { _ModuleWithoutApi } from 'ag-grid-community';

import { RowNumbersModule } from '../rowNumbers/rowNumbersModule';
import { VERSION } from '../version';
import { FormulaCellEditor } from './editor/formulaCellEditor';
import { formulaCellEditorCSS } from './editor/formulaCellEditor.css-GENERATED';
import { formulaCSS } from './formula.css-GENERATED';
import { FormulaDataService } from './formulaDataService';
import { FormulaService } from './formulaService';

/**
 * @feature FormulaModule
 */
export const FormulaModule: _ModuleWithoutApi = {
    moduleName: 'Formula',
    version: VERSION,
    userComponents: { agFormulaCellEditor: FormulaCellEditor },
    beans: [FormulaService, FormulaDataService],
    dependsOn: [RowNumbersModule],
    css: [formulaCSS, formulaCellEditorCSS],
};
