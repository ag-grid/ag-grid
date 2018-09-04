import {Bean, ICompFactory, Component, Autowired, Context} from "ag-grid-community";
import {PivotDropZonePanel} from "./sideBar/providedPanels/columns/panels/pivotDropZonePanel";

@Bean('pivotCompFactory')
export class PivotCompFactory implements ICompFactory {

    @Autowired('context') private context: Context;

    public create(): Component {

        let pivotComp = new PivotDropZonePanel(true);
        this.context.wireBean(pivotComp);

        return pivotComp;
    }
}