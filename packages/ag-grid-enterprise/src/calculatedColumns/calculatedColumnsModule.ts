import type { _ModuleWithoutApi } from 'ag-grid-community';
import { ColumnApiModule, TooltipModule, _PopupModule } from 'ag-grid-community';

import { FormulaModule } from '../formula/formulaModule';
import { VERSION } from '../version';
import calculatedColumnsCSS from './calculatedColumns.css';
import { CalculatedColumnsService } from './calculatedColumnsService';

/**
 * @feature Calculated Columns
 */
export const CalculatedColumnsModule: _ModuleWithoutApi = {
    moduleName: 'CalculatedColumns',
    version: VERSION,
    beans: [CalculatedColumnsService],
    dependsOn: [FormulaModule, _PopupModule, ColumnApiModule, TooltipModule],
    icons: {
        calculatedColumnsHeader: 'fx',
        calculatedColumnAdd: 'plus',
        calculatedColumnEdit: 'edit',
        calculatedColumnRemove: 'minus',
    },
    css: [calculatedColumnsCSS],
};
