import type { IAutoCompleteComponentParams } from '../../interfaces/iAutoComplete';
import type { ICellEditorParams } from '../../interfaces/iCellEditor';

export interface ITextCellEditorParams<TData = any, TValue = any, TContext = any>
    extends ICellEditorParams<TData, TValue, TContext>, IAutoCompleteComponentParams {
    /** If `true`, the editor will use the provided `colDef.valueFormatter` to format the value displayed in the editor.
     * Used when the cell value needs formatting prior to editing, such as when using reference data and you
     * want to display text rather than code. */
    useFormatter: boolean;

    /**
     * Max number of characters to allow.
     * @default 524288
     */
    maxLength?: number;
}
