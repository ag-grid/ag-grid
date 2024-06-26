import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
export declare class SelectableService extends BeanStub implements NamedBean {
    beanName: "selectableService";
    private rowModel;
    private selectionService;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    /**
     * Used by CSRM only, to update selectable state after group state changes.
     */
    updateSelectableAfterGrouping(): void;
    private updateSelectable;
}
