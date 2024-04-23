import { Component } from "ag-grid-community";
import { AdvancedFilterBuilderItem, CreatePillParams } from "./iAdvancedFilterBuilder";
import { InputPillComp } from "./inputPillComp";
import { SelectPillComp } from "./selectPillComp";
export declare class JoinPillWrapperComp extends Component {
    private advancedFilterExpressionService;
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
