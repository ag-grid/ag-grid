import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { AdvancedFilterBuilderEvents, AdvancedFilterBuilderItem, CreatePillParams } from './iAdvancedFilterBuilder';
import type { InputPillComp } from './inputPillComp';
import type { SelectPillComp } from './selectPillComp';
export declare class JoinPillWrapperComp extends Component<AdvancedFilterBuilderEvents> {
    private advancedFilterExpressionService;
    wireBeans(beans: BeanCollection): void;
    private filterModel;
    private ePill;
    constructor();
    init(params: {
        item: AdvancedFilterBuilderItem;
        createPill: (params: CreatePillParams) => SelectPillComp | InputPillComp;
    }): void;
    getDragName(): string;
    getAriaLabel(): string;
    getValidationMessage(): string | null;
    getFocusableElement(): HTMLElement;
}
