import {Bean, IComponentFactory, Component, Autowired, Context} from "ag-grid/main";
import {RowGroupColumnsPanel} from "./toolPanel/columnDrop/rowGroupColumnsPanel";

@Bean('rowGroupCompFactory')
export class RowGroupCompFactory implements IComponentFactory {

    @Autowired('context') private context: Context;
    
    public create(): Component {
        
        var rowGroupComp = new RowGroupColumnsPanel(true);
        this.context.wireBean(rowGroupComp);
        
        return rowGroupComp;
    }
}