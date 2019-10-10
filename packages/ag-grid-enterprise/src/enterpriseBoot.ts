import {Autowired, Bean, PostConstruct, UserComponentRegistry} from "ag-grid-community";
import {SetFilter} from "./setFilter/setFilter";
import {RichSelectCellEditor} from "./rendering/richSelect/richSelectCellEditor";
import {DetailCellRenderer} from "./rendering/detail/detailCellRenderer";
import {TotalRowsComp} from "./statusBar/providedPanels/totalRowsComp";
import {TotalAndFilteredRowsComp} from "./statusBar/providedPanels/totalAndFilteredRowsComp";
import {AggregationComp} from "./statusBar/providedPanels/aggregationComp";
import {SelectedRowsComp} from "./statusBar/providedPanels/selectedRowsComp";
import {FilteredRowsComp} from "./statusBar/providedPanels/filteredRowsComp";
import {FiltersToolPanel} from "./sideBar/providedPanels/filters/filtersToolPanel";
import {SetFloatingFilterComp} from "./setFilter/setFloatingFilter";

@Bean('enterpriseBoot')
export class EnterpriseBoot {

    @Autowired('userComponentRegistry') private userComponentRegistry: UserComponentRegistry;

    @PostConstruct
    private init(): void {
        this.userComponentRegistry.registerDefaultComponent('agRichSelect', RichSelectCellEditor);
        this.userComponentRegistry.registerDefaultComponent('agRichSelectCellEditor', RichSelectCellEditor);
        this.userComponentRegistry.registerDefaultComponent('agSetColumnFilter', SetFilter);
        this.userComponentRegistry.registerDefaultComponent('agSetColumnFloatingFilter', SetFloatingFilterComp);
        this.userComponentRegistry.registerDefaultComponent('agDetailCellRenderer', DetailCellRenderer);
        this.userComponentRegistry.registerDefaultComponent('agAggregationComponent', AggregationComp);
        this.userComponentRegistry.registerDefaultComponent('agFiltersToolPanel', FiltersToolPanel);
        this.userComponentRegistry.registerDefaultComponent('agSelectedRowCountComponent', SelectedRowsComp);
        this.userComponentRegistry.registerDefaultComponent('agTotalRowCountComponent', TotalRowsComp);
        this.userComponentRegistry.registerDefaultComponent('agFilteredRowCountComponent', FilteredRowsComp);
        this.userComponentRegistry.registerDefaultComponent('agTotalAndFilteredRowCountComponent', TotalAndFilteredRowsComp);
    }

}
