import {Bean, ICompFactory, Component, Autowired, Context} from "ag-grid-community";
import {RowGroupDropZonePanel} from "./sideBar/providedPanels/columns/panels/rowGroupDropZonePanel";

@Bean('rowGroupCompFactory')
export class RowGroupCompFactory implements ICompFactory {

    @Autowired('context') private context: Context;

    public create(): Component {

        let rowGroupComp = new RowGroupDropZonePanel(true);
        this.context.wireBean(rowGroupComp);

        return rowGroupComp;
    }
}