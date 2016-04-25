import {Bean, CellEditorFactory, Autowired, FilterManager, PostConstruct} from "ag-grid/main";
import {SetFilter} from "./setFilter/setFilter";
import {RichSelectCellEditor} from "./rendering/richSelect/richSelectCellEditor";

@Bean('enterpriseBoot')
export class EnterpriseBoot {

    private static RICH_SELECT = 'richSelect';

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('cellEditorFactory') private cellEditorFactory: CellEditorFactory;

    @PostConstruct
    private init(): void {
        this.filterManager.registerFilter('set', SetFilter);
        this.cellEditorFactory.addCellEditor(EnterpriseBoot.RICH_SELECT, RichSelectCellEditor);
    }
}