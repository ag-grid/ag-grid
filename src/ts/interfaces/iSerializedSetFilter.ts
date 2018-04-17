import {SerializedFilter} from "./iFilter";

export interface SerializedSetFilter extends SerializedFilter {
    values: string[]
}