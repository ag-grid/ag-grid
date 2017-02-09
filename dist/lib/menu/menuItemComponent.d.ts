// ag-grid-enterprise v8.0.0
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
