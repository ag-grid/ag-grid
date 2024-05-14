import { useFilterManager } from "./filterManager";
import { useDateFilter } from "./provided/date/dateFilter";
import { useNumberFilter } from "./provided/number/numberFilter";
import { useNumberFloatingFilter } from "./provided/number/numberFloatingFilter";
import { useTextFilter as rawUseTextFilter } from "./provided/text/textFilter";
import { useQuickFilter } from "./quickFilterService";

export function useTextFilter() {
    console.log("useTextFilter Function");
    useFilterManager();
    rawUseTextFilter();
}

export function useNumberFilters() {
    console.log("useNumberFilter Function");
    useFilterManager();
    useNumberFilter();
    useNumberFloatingFilter();
}


export function useFilters(){
    console.log("useFilters Function");  
    useTextFilter();
    useNumberFloatingFilter();
    useNumberFilter();
    useFilterManager();
    useQuickFilter();
    useDateFilter();
}
