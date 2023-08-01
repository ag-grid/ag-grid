import { IRowNode } from "./iRowNode";
import { AdvancedFilterModel } from "./advancedFilterModel";

export interface IAdvancedFilterService {
    isFilterPresent(): boolean;

    doesFilterPass(node: IRowNode): boolean;

    getModel(): AdvancedFilterModel | null;

    setModel(model: AdvancedFilterModel | null): void
}