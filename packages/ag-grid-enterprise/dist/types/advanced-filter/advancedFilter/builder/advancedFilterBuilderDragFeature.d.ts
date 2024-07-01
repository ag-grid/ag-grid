import type { AgEvent } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { VirtualList } from 'ag-grid-enterprise';
import type { AdvancedFilterBuilderComp } from './advancedFilterBuilderComp';
import type { AdvancedFilterBuilderItem } from './iAdvancedFilterBuilder';
export interface AdvancedFilterBuilderDragStartedEvent extends AgEvent<'advancedFilterBuilderDragStarted'> {
    item: AdvancedFilterBuilderItem;
}
export type AdvancedFilterBuilderDragFeatureEvent = 'advancedFilterBuilderDragStarted' | 'advancedFilterBuilderDragEnded';
export declare class AdvancedFilterBuilderDragFeature extends BeanStub<AdvancedFilterBuilderDragFeatureEvent> {
    private readonly comp;
    private readonly virtualList;
    constructor(comp: AdvancedFilterBuilderComp, virtualList: VirtualList);
    postConstruct(): void;
    private getCurrentDragValue;
    private moveItem;
}
