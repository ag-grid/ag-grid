import type { ICellEditorParams } from '../../interfaces/iCellEditor';

export interface IFormulaCellEditorParams<TData = any, TValue = any, TContext = any> extends ICellEditorParams<
    TData,
    TValue,
    TContext
> {
    /**
     * Set to `true` to validate formulas while editing.
     * If a custom `getValidationErrors` is provided, internal validation will still run.
     * @default false
     */
    validateFormulas?: boolean;
}
