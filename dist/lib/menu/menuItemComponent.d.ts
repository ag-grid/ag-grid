// ag-grid-enterprise v7.0.2
import { MenuItemDef, Component } from "ag-grid";
export declare class MenuItemComponent extends Component {
    private popupService;
    private static TEMPLATE;
    static EVENT_ITEM_SELECTED: string;
    private params;
    constructor(params: MenuItemDef);
    private onOptionSelected();
    destroy(): void;
}
