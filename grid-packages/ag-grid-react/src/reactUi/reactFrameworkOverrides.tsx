import { VanillaFrameworkOverrides } from "ag-grid-community";
import GroupCellRenderer from "./cellRenderer/groupCellRenderer";
import DetailCellRenderer from "./cellRenderer/detailCellRenderer";

export class ReactFrameworkOverrides extends VanillaFrameworkOverrides {

    private frameworkComponents: any = {
        agGroupCellRenderer: GroupCellRenderer,
        agGroupRowRenderer: GroupCellRenderer,
        agDetailCellRenderer: DetailCellRenderer
    };

    public frameworkComponent(name: string): any {
        return this.frameworkComponents[name];
    }

    isFrameworkComponent(comp: any): boolean {
        if (!comp) { return false; }
        const prototype = comp.prototype;
        const isJsComp = prototype && 'getGui' in prototype;
        return !isJsComp;
    }
}