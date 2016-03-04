import {Bean} from "ag-grid/main";
import {Autowired} from "ag-grid/main";
import {FilterManager} from "ag-grid/main";
import {PostConstruct} from "ag-grid/main";
import {SetFilter} from "./setFilter/setFilter";

@Bean('enterpriseBoot')
export class EnterpriseBoot {

    @Autowired('filterManager') private filterManager: FilterManager;

    @PostConstruct
    private init(): void {
        this.filterManager.registerFilter('set', SetFilter);
    }
}