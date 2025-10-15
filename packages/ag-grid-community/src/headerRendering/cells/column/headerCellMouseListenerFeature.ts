import { BeanStub } from '../../../context/beanStub';
import type { AgColumn } from '../../../entities/agColumn';

export class HeaderCellMouseListenerFeature extends BeanStub {
    constructor(private readonly column: AgColumn) {
        super();
    }
}
