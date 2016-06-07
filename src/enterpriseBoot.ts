import {Bean, CellEditorFactory, Autowired, FilterManager, PostConstruct} from "ag-grid/main";
import {SetFilter} from "./setFilter/setFilter";
import {RichSelectCellEditor} from "./rendering/richSelect/richSelectCellEditor";
import {LargeTextCellEditor} from "./rendering/largeText/largeTextCellEditor";
import {LicenseManager} from "./licenseManager";

@Bean('enterpriseBoot')
export class EnterpriseBoot {

    private static RICH_SELECT = 'richSelect';
    private static LARGE_TEXT = 'largeText';

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('cellEditorFactory') private cellEditorFactory: CellEditorFactory;
    @Autowired('licenseManager') private licenseManager: LicenseManager;

    @PostConstruct
    private init(): void {
        this.filterManager.registerFilter('set', SetFilter);
        this.cellEditorFactory.addCellEditor(EnterpriseBoot.RICH_SELECT, RichSelectCellEditor);
        this.cellEditorFactory.addCellEditor(EnterpriseBoot.LARGE_TEXT, LargeTextCellEditor);

        this.licenseManager.validateLicense();
    }
}