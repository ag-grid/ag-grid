import { ProvidedFilterModel } from "ag-grid-community";

export interface SetFilterModel extends ProvidedFilterModel {
    values: string[];
}
