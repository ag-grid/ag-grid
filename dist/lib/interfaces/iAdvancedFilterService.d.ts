import { IRowNode } from "./iRowNode";
import { AdvancedFilterModel } from "./advancedFilterModel";
import { IAdvancedFilterCtrl } from "./iAdvancedFilterCtrl";
export interface IAdvancedFilterService {
    isEnabled(): boolean;
    isFilterPresent(): boolean;
    doesFilterPass(node: IRowNode): boolean;
    getModel(): AdvancedFilterModel | null;
    setModel(model: AdvancedFilterModel | null): void;
    isHeaderActive(): boolean;
    getCtrl(): IAdvancedFilterCtrl;
    updateValidity(): boolean;
}
