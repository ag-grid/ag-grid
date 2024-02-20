import { BeanStub } from "../context/beanStub";
export declare class SelectableService extends BeanStub {
    private rowModel;
    private selectionService;
    private init;
    /**
     * Used by CSRM only, to update selectable state after group state changes.
     */
    updateSelectableAfterGrouping(): void;
    private updateSelectable;
}
