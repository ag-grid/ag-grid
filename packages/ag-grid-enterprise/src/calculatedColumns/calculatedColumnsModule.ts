import type { _CalculatedColumnsGridApi, _ModuleWithApi } from 'ag-grid-community';
import { ColumnApiModule, TooltipModule, _PopupModule, _UserColumnService } from 'ag-grid-community';

import { FormulaModule } from '../formula/formulaModule';
import { VERSION } from '../version';
import calculatedColumnsCSS from './calculatedColumns.css';
import { refreshCalculatedColumns } from './calculatedColumnsApi';
import { CalculatedColumnsService } from './calculatedColumnsService';

/**
 * @feature Calculated Columns
 */
export const CalculatedColumnsModule: _ModuleWithApi<_CalculatedColumnsGridApi> = {
    moduleName: 'CalculatedColumns',
    version: VERSION,
    beans: [CalculatedColumnsService, _UserColumnService],
    apiFunctions: { refreshCalculatedColumns },
    dependsOn: [FormulaModule, _PopupModule, ColumnApiModule, TooltipModule],
    icons: {
        calculatedColumnsHeader: 'fx',
        calculatedColumnAdd: 'plus',
        calculatedColumnEdit: 'edit',
        calculatedColumnRemove: 'minus',
    },
    css: [calculatedColumnsCSS],
};
