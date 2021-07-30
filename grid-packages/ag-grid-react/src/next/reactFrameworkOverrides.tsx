import { VanillaFrameworkOverrides } from "ag-grid-community";
import { GroupCellRenderer } from "./cellRenderer/groupCellRenderer";

export class ReactFrameworkOverrides extends VanillaFrameworkOverrides {

    private frameworkComponents: any = {
        agGroupCellRenderer: GroupCellRenderer
    };

    public frameworkComponent(name: string): any {
        return this.frameworkComponents[name];
    }

}