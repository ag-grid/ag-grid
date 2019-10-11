import { ProvidedFilterModel, ModuleLogger } from "ag-grid-community";

ModuleLogger.logModuleClass('SetFilter.SetFilterModel');

export interface SetFilterModel extends ProvidedFilterModel {
    values: string[];
}
