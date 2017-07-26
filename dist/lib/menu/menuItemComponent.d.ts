// ag-grid-enterprise v12.0.2
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
