import {FilterModel} from "ag-grid-community";

export interface SetFilterModel extends FilterModel {
    values: string[]
}