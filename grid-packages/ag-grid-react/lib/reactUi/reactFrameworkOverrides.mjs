// ag-grid-react v30.0.4
import { VanillaFrameworkOverrides } from "ag-grid-community";
import GroupCellRenderer from "./cellRenderer/groupCellRenderer.mjs";
import DetailCellRenderer from "./cellRenderer/detailCellRenderer.mjs";
export class ReactFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor() {
        super(...arguments);
        this.frameworkComponents = {
            agGroupCellRenderer: GroupCellRenderer,
            agGroupRowRenderer: GroupCellRenderer,
            agDetailCellRenderer: DetailCellRenderer
        };
    }
    frameworkComponent(name) {
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
