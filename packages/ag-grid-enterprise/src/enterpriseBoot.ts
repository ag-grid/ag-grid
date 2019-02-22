import { Autowired, Bean, CellEditorFactory, ComponentProvider, FilterManager, PostConstruct } from "ag-grid-community";
import { SetFilter } from "./setFilter/setFilter";
import { RichSelectCellEditor } from "./rendering/richSelect/richSelectCellEditor";
import { LicenseManager } from "./licenseManager";
import { DetailCellRenderer } from "./rendering/detail/detailCellRenderer";
import {TotalRowsComp} from "./statusBar/providedPanels/totalRowsComp";
import {TotalAndFilteredRowsComp} from "./statusBar/providedPanels/totalAndFilteredRowsComp";
import {ColumnToolPanel} from "./sideBar/providedPanels/columns/columnToolPanel";
import {AggregationComp} from "./statusBar/providedPanels/aggregationComp";
import {SelectedRowsComp} from "./statusBar/providedPanels/selectedRowsComp";
import {FilteredRowsComp} from "./statusBar/providedPanels/filteredRowsComp";
import {FiltersToolPanel} from "./sideBar/providedPanels/filters/filtersToolPanel";

@Bean('enterpriseBoot')
export class EnterpriseBoot {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('cellEditorFactory') private cellEditorFactory: CellEditorFactory;
    @Autowired('licenseManager') private licenseManager: LicenseManager;
    @Autowired('componentProvider') private componentProvider: ComponentProvider;

    @PostConstruct
    private init(): void {
        this.componentProvider.registerDefaultComponent('agRichSelect', RichSelectCellEditor);
        this.componentProvider.registerDefaultComponent('agRichSelectCellEditor', RichSelectCellEditor);
        this.componentProvider.registerDefaultComponent('agSetColumnFilter', SetFilter);
        this.componentProvider.registerDefaultComponent('agDetailCellRenderer', DetailCellRenderer);
        this.componentProvider.registerDefaultComponent('agAggregationComponent', AggregationComp);
        this.componentProvider.registerDefaultComponent('agColumnsToolPanel', ColumnToolPanel);
        this.componentProvider.registerDefaultComponent('agFiltersToolPanel', FiltersToolPanel);
        this.componentProvider.registerDefaultComponent('agSelectedRowCountComponent', SelectedRowsComp);
        this.componentProvider.registerDefaultComponent('agTotalRowCountComponent', TotalRowsComp);
        this.componentProvider.registerDefaultComponent('agFilteredRowCountComponent', FilteredRowsComp);
        this.componentProvider.registerDefaultComponent('agTotalAndFilteredRowCountComponent', TotalAndFilteredRowsComp);
    }

}