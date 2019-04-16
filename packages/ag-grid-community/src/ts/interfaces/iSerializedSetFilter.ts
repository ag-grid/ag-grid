import { FilterModel } from "./iFilter";

export interface SerializedSetFilter extends FilterModel {
    values: string[] | null;
}