import {Bean, CellEditorFactory, Autowired, FilterManager, PostConstruct, PreConstruct, ComponentProvider} from "ag-grid/main";
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

    @PreConstruct
    private init(): void {
        this.componentProvider.registerComponent('agRichSelect', RichSelectCellEditor);
        this.componentProvider.registerComponent('agRichSelectCellEditor', RichSelectCellEditor);
        this.componentProvider.registerComponent('agSetColumnFilter', SetFilter);
        this.componentProvider.registerComponent('agDetailCellRenderer', DetailCellRenderer);

        this.licenseManager.validateLicense();
    }
}