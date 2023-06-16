// ag-grid-react v30.0.2
import { VanillaFrameworkOverrides } from "ag-grid-community";
import GroupCellRenderer from "../reactUi/cellRenderer/groupCellRenderer";
import DetailCellRenderer from "../reactUi/cellRenderer/detailCellRenderer";
export class ReactFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(reactUi) {
        super();
        this.frameworkComponents = {
            agGroupCellRenderer: GroupCellRenderer,
            agGroupRowRenderer: GroupCellRenderer,
            agDetailCellRenderer: DetailCellRenderer
        };
        this.reactUi = reactUi;
    }
    frameworkComponent(name) {
        if (!this.reactUi) {
            return;
        }
        return this.frameworkComponents[name];
    }
    isFrameworkComponent(comp) {
        if (!comp) {
            return false;
        }
        const prototype = comp.prototype;
        const isJsComp = prototype && 'getGui' in prototype;
        return !isJsComp;
    }
}
