import {Autowired, Bean, PostConstruct, UserComponentRegistry} from "ag-grid-community";
import {RichSelectCellEditor} from "./rendering/richSelect/richSelectCellEditor";
import {DetailCellRenderer} from "./rendering/detail/detailCellRenderer";

@Bean('enterpriseBoot')
export class EnterpriseBoot {

    @Autowired('userComponentRegistry') private userComponentRegistry: UserComponentRegistry;

    @PostConstruct
    private init(): void {
        this.userComponentRegistry.registerDefaultComponent('agRichSelect', RichSelectCellEditor);
        this.userComponentRegistry.registerDefaultComponent('agRichSelectCellEditor', RichSelectCellEditor);
        this.userComponentRegistry.registerDefaultComponent('agDetailCellRenderer', DetailCellRenderer);
    }

}
