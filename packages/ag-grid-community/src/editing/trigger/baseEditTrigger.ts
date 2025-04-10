import type { Bean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';

interface EditTrigger extends Bean {
    shouldStartEditing?(
        rowId: string,
        colId?: string,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;
    shouldStopEditing?(
        rowId: string,
        colId?: string,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;
}

export abstract class BaseEditTrigger extends BeanStub implements EditTrigger {}
