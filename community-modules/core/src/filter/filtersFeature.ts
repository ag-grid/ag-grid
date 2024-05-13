import { useFilterManager } from "./filterManager";
import { useDateFilter } from "./provided/date/dateFilter";
import { useNumberFilter } from "./provided/number/numberFilter";
import { useNumberFloatingFilter } from "./provided/number/numberFloatingFilter";
import { useTextFilter } from "./provided/text/textFilter";
import { useQuickFilter } from "./quickFilterService";



export function useFilters(){
    useTextFilter();
    useNumberFloatingFilter();
    useNumberFilter();
    useFilterManager();
    useQuickFilter();
    useDateFilter();
}