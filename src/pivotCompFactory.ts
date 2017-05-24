import {Bean, ICompFactory, Component, Autowired, Context} from "ag-grid/main";
import {RowGroupColumnsPanel} from "./toolPanel/columnDrop/rowGroupColumnsPanel";
import {PivotColumnsPanel} from "./toolPanel/columnDrop/pivotColumnsPanel";

@Bean('pivotCompFactory')
export class PivotCompFactory implements ICompFactory {

    @Autowired('context') private context: Context;
    
    public create(): Component {
        
        let pivotComp = new PivotColumnsPanel(true);
        this.context.wireBean(pivotComp);
        
        return pivotComp;
    }
}