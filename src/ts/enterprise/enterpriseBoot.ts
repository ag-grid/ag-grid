import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {FilterManager} from "../filter/filterManager";
import {PostConstruct} from "../context/context";
import {SetFilter} from "./setFilter/setFilter";

@Bean('enterpriseBoot')
export class EnterpriseBoot {

    @Autowired('filterManager') private filterManager: FilterManager;

    @PostConstruct
    private init(): void {
        this.filterManager.registerFilter('set', SetFilter);
    }
}