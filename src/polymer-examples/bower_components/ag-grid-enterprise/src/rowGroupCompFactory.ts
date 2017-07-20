import {Bean, ICompFactory, Component, Autowired, Context} from "ag-grid/main";
import {RowGroupColumnsPanel} from "./toolPanel/columnDrop/rowGroupColumnsPanel";

@Bean('rowGroupCompFactory')
export class RowGroupCompFactory implements ICompFactory {

    @Autowired('context') private context: Context;
    
    public create(): Component {
        
        let rowGroupComp = new RowGroupColumnsPanel(true);
        this.context.wireBean(rowGroupComp);
        
        return rowGroupComp;
    }
}