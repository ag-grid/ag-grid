import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import type { ElementParams } from '../../utils/element';
import type { ComponentSelector } from '../../widgets/component';
import type { GridInputTextField } from '../../widgets/gridWidgetTypes';

export interface CellEditorInput<TValue, P extends ICellEditorParams, I extends GridInputTextField> {
    getTemplate(): ElementParams;
    getAgComponents(): ComponentSelector[];
    init(eInput: I, params: P): void;
    getValue(): TValue | null | undefined;
    getStartValue(): string | null | undefined;
    /** When `untouched`, the widget still holds its seed, so `params.value` is what a commit would write. */
    getValidationErrors(untouched: boolean): string[] | null;
    setCaret?(): void;
    /** Commit any buffered input to the field's value before the grid reads it on stop (e.g. a Firefox date segment). */
    flushInput?(): void;
}
