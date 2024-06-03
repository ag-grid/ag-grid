import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import type { AgInputTextField } from '../../widgets/agInputTextField';
import type { ComponentClass } from '../../widgets/component';

export interface CellEditorInput<TValue, P extends ICellEditorParams, I extends AgInputTextField> {
    getTemplate(): string;
    getAgComponents(): ComponentClass[];
    init(eInput: I, params: P): void;
    getValue(): TValue | null | undefined;
    getStartValue(): string | null | undefined;
    setCaret?(): void;
}
