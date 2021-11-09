import { VanillaFrameworkOverrides } from "@ag-grid-community/core";
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

}