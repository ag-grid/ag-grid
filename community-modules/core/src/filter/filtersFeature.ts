import { onlyUsedInFilters } from "../utils/filtersOnly";
import { useFilterManager } from "./filterManager";
import { useQuickFilter } from "./quickFilterService";



export function useFilters(){
    // let onlyUsedInFilters;
    // await import("../utils/generic").then(m => onlyUsedInFilters = m.onlyUsedInFilters);

    useFilterManager();
    useQuickFilter();
    onlyUsedInFilters();
}