import { VanillaFrameworkOverrides } from "@ag-grid-community/core";
import DetailCellRenderer from "../cellRenderer/detailCellRenderer";
import GroupCellRenderer from "../cellRenderer/groupCellRenderer";
export class SolidFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor() {
        super();
    }
    frameworkComponents = {
        agGroupCellRenderer: GroupCellRenderer,
        agGroupRowRenderer: GroupCellRenderer,
        agDetailCellRenderer: DetailCellRenderer
    };
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
