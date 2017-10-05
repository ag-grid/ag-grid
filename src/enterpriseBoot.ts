import {Bean, CellEditorFactory, Autowired, FilterManager, PostConstruct, PreConstruct, ComponentProvider} from "ag-grid/main";
import {SetFilter} from "./setFilter/setFilter";
import {RichSelectCellEditor} from "./rendering/richSelect/richSelectCellEditor";
import {LicenseManager} from "./licenseManager";

@Bean('enterpriseBoot')
export class EnterpriseBoot {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('cellEditorFactory') private cellEditorFactory: CellEditorFactory;
    @Autowired('licenseManager') private licenseManager: LicenseManager;
    @Autowired('componentProvider') private componentProvider: ComponentProvider;

    @PreConstruct
    private init(): void {
        this.componentProvider.registerComponent('richSelect', RichSelectCellEditor);
        this.componentProvider.registerComponent('richSelectCellEditor', RichSelectCellEditor);
        this.componentProvider.registerComponent('setColumnFilter', SetFilter);

        this.licenseManager.validateLicense();
    }


}