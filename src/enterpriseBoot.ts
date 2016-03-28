import {Bean, CellEditorFactory, Autowired, FilterManager, PostConstruct} from "ag-grid/main";
import {SetFilter} from "./setFilter/setFilter";

@Bean('enterpriseBoot')
export class EnterpriseBoot {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('cellEditorFactory') private cellEditorFactory: CellEditorFactory;

    @PostConstruct
    private init(): void {
        this.filterManager.registerFilter('set', SetFilter);
    }
}