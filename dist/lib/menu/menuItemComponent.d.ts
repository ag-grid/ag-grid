// ag-grid-enterprise v9.1.0
import { MenuItemDef, Component } from "ag-grid";
export declare class MenuItemComponent extends Component {
    private gridOptionsWrapper;
    private static TEMPLATE;
    static EVENT_ITEM_SELECTED: string;
    private params;
    constructor(params: MenuItemDef);
    private init();
    private onOptionSelected();
    destroy(): void;
}
