import {Autowired, Bean, CellEditorFactory, ComponentProvider, FilterManager, PostConstruct} from "ag-grid/main";
import {SetFilter} from "./setFilter/setFilter";
import {RichSelectCellEditor} from "./rendering/richSelect/richSelectCellEditor";
import {LicenseManager} from "./licenseManager";
import {DetailCellRenderer} from "./rendering/detail/detailCellRenderer";

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

        this.licenseManager.validateLicense();
    }
}