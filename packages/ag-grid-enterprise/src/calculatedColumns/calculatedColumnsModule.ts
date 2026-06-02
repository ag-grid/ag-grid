import type { _CalculatedColumnsGridApi, _ModuleWithApi } from 'ag-grid-community';
import { ColumnApiModule, TooltipModule, _PopupModule } from 'ag-grid-community';

import { FormulaModule } from '../formula/formulaModule';
import { VERSION } from '../version';
import calculatedColumnsCSS from './calculatedColumns.css';
import {
    addCalculatedColumn,
    openCalculatedColumnDialog,
    removeCalculatedColumn,
    updateCalculatedColumn,
} from './calculatedColumnsApi';
import { CalculatedColumnsService } from './calculatedColumnsService';

/**
 * @feature Calculated Columns
 */
export const CalculatedColumnsModule: _ModuleWithApi<_CalculatedColumnsGridApi<any>> = {
    moduleName: 'CalculatedColumns',
    version: VERSION,
    beans: [CalculatedColumnsService],
    apiFunctions: {
        addCalculatedColumn,
        updateCalculatedColumn,
        removeCalculatedColumn,
        openCalculatedColumnDialog,
    },
    dependsOn: [FormulaModule, _PopupModule, ColumnApiModule, TooltipModule],
    icons: {
        calculatedColumnAdd: 'plus',
        calculatedColumnEdit: 'edit',
        calculatedColumnRemove: 'minus',
    },
    css: [calculatedColumnsCSS],
};
